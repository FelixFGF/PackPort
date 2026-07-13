package com.packbridge.service;

import com.packbridge.repository.LoginAttemptRepository;
import com.packbridge.security.entity.LoginAttemptEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.Optional;

@Service
public class LoginAttemptService {

    private final LoginAttemptRepository loginAttemptRepository;
    private final SecurityEventService securityEventService;

    // Configurable later via env vars
    private static final int WARN_AFTER_FAILED_ATTEMPTS = 5;
    private static final int DELAY_AFTER_FAILED_ATTEMPTS = 10;
    private static final int LOCK_AFTER_FAILED_ATTEMPTS = 20;
    private static final Duration LOCK_DURATION = Duration.ofHours(24);

    public LoginAttemptService(LoginAttemptRepository loginAttemptRepository, SecurityEventService securityEventService) {
        this.loginAttemptRepository = loginAttemptRepository;
        this.securityEventService = securityEventService;
    }

    @Transactional
    public void recordSuccessfulLogin(
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId
    ) {
        // Persist attempt
        LoginAttemptEntity e = baseAttempt("LOGIN_SUCCESS", username, ipAddress, userAgent, browser, operatingSystem, correlationId);
        e.setSuccess(true);
        e.setReason(null);
        e.setOccurredAt(OffsetDateTime.now());
        loginAttemptRepository.save(e);

        // Persist security event
        securityEventService.recordEvent(
                "LOGIN_SUCCESS",
                username,
                ipAddress,
                userAgent,
                browser,
                operatingSystem,
                "INFO",
                "Admin login successful",
                correlationId
        );
    }

    @Transactional
    public void recordFailedLogin(
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId,
            String failureReason,
            int failedAttemptsSoFar
    ) {
        LoginAttemptEntity e = baseAttempt("LOGIN_FAILED", username, ipAddress, userAgent, browser, operatingSystem, correlationId);
        e.setSuccess(false);
        e.setReason(failureReason);
        e.setOccurredAt(OffsetDateTime.now());
        loginAttemptRepository.save(e);

        securityEventService.recordEvent(
                "LOGIN_FAILED",
                username,
                ipAddress,
                userAgent,
                browser,
                operatingSystem,
                "WARN",
                failureReason != null ? failureReason : "Invalid credentials",
                correlationId
        );

        // Apply progressive security actions based on attempt count threshold.
        // - 5 -> WARNING
        // - 10 -> DELAY
        // - 20 -> LOCK
        if (failedAttemptsSoFar >= LOCK_AFTER_FAILED_ATTEMPTS) {
            recordLock(username, ipAddress, userAgent, browser, operatingSystem, correlationId, "Account locked for 24 hours");
        } else if (failedAttemptsSoFar >= DELAY_AFTER_FAILED_ATTEMPTS) {
            recordDelay(username, ipAddress, userAgent, browser, operatingSystem, correlationId, "Progressive delay applied");
        } else if (failedAttemptsSoFar >= WARN_AFTER_FAILED_ATTEMPTS) {
            recordWarning(username, ipAddress, userAgent, browser, operatingSystem, correlationId, "Warning: multiple failed login attempts");
        }
    }

    @Transactional
    public void recordWarning(
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId,
            String reason
    ) {
        LoginAttemptEntity e = baseAttempt("LOGIN_WARNING", username, ipAddress, userAgent, browser, operatingSystem, correlationId);
        e.setSuccess(false);
        e.setReason(reason);
        e.setOccurredAt(OffsetDateTime.now());
        loginAttemptRepository.save(e);

        securityEventService.recordEvent(
                "LOGIN_WARNING",
                username,
                ipAddress,
                userAgent,
                browser,
                operatingSystem,
                "WARN",
                reason != null ? reason : "Login warning",
                correlationId
        );
    }

    @Transactional
    public void recordDelay(
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId,
            String reason
    ) {
        LoginAttemptEntity e = baseAttempt("LOGIN_DELAY", username, ipAddress, userAgent, browser, operatingSystem, correlationId);
        e.setSuccess(false);
        e.setReason(reason);
        e.setOccurredAt(OffsetDateTime.now());
        loginAttemptRepository.save(e);

        securityEventService.recordEvent(
                "LOGIN_DELAY",
                username,
                ipAddress,
                userAgent,
                browser,
                operatingSystem,
                "INFO",
                reason != null ? reason : "Login delay",
                correlationId
        );
    }

    @Transactional
    public void recordLock(
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId,
            String reason
    ) {
        LoginAttemptEntity e = baseAttempt("LOGIN_LOCKED", username, ipAddress, userAgent, browser, operatingSystem, correlationId);
        e.setSuccess(false);
        e.setReason(reason);
        e.setOccurredAt(OffsetDateTime.now());
        loginAttemptRepository.save(e);

        securityEventService.recordEvent(
                "LOGIN_LOCKED",
                username,
                ipAddress,
                userAgent,
                browser,
                operatingSystem,
                "ERROR",
                reason != null ? reason : "Account locked",
                correlationId
        );
    }

    @Transactional
    public void recordUnlock(
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId,
            String reason
    ) {
        LoginAttemptEntity e = baseAttempt("LOGIN_UNLOCKED", username, ipAddress, userAgent, browser, operatingSystem, correlationId);
        e.setSuccess(true);
        e.setReason(reason);
        e.setOccurredAt(OffsetDateTime.now());
        loginAttemptRepository.save(e);

        securityEventService.recordEvent(
                "LOGIN_UNLOCKED",
                username,
                ipAddress,
                userAgent,
                browser,
                operatingSystem,
                "INFO",
                reason != null ? reason : "Account unlocked",
                correlationId
        );
    }

    /**
     * Helper to persist a base LoginAttemptEntity.
     */
    private LoginAttemptEntity baseAttempt(
            String eventType,
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String correlationId
    ) {
        LoginAttemptEntity e = new LoginAttemptEntity();
        e.setEventType(eventType);
        e.setUsername(username);
        e.setIpAddress(ipAddress);
        e.setUserAgent(userAgent);
        e.setBrowser(browser);
        e.setOperatingSystem(operatingSystem);
        e.setCorrelationId(correlationId);
        // occurredAt, success, reason are set by specific methods
        return e;
    }

    /**
     * Determine how many failed attempts exist so far for this username+ip for progressive logic.
     * Uses persisted attempts (simple and robust).
     */
    @Transactional(readOnly = true)
    public int countFailedAttemptsSoFar(String username, String ipAddress) {
        // Repository doesn't have custom queries yet; keep this safe/compilable by scanning.
        // Since admin login attempts are low volume, this is acceptable.
        // NOTE: This method is optional; callers can pass failedAttemptsSoFar directly.
        // Kept here to avoid placeholder logic and allow future controller/filter wiring.
        return (int) loginAttemptRepository.findAll().stream()
                .filter(a -> "LOGIN_FAILED".equals(a.getEventType()) && a.getUsername() != null && a.getUsername().equals(username))
                .filter(a -> a.getIpAddress() != null && a.getIpAddress().equals(ipAddress))
                .count();
    }
}