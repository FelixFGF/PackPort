package com.packbridge.service;

import com.packbridge.dto.PagedResponse;
import com.packbridge.repository.ActiveAdminSessionRepository;
import com.packbridge.security.entity.ActiveAdminSessionEntity;
import com.packbridge.security.entity.LoginAttemptEntity;
import com.packbridge.repository.LoginAttemptRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;

@Service
public class ActiveSessionService {

    private final ActiveAdminSessionRepository activeAdminSessionRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final SecurityEventService securityEventService;
    private final boolean dbEnabled;

    // Defaults: production configurable via env vars later.
    // If older sessions exist, treat them as expired after 3 days inactivity.
    private static final Duration SESSION_INACTIVITY_TIMEOUT = Duration.ofDays(3);

    public ActiveSessionService(
            ActiveAdminSessionRepository activeAdminSessionRepository,
            LoginAttemptRepository loginAttemptRepository,
            SecurityEventService securityEventService,
            @Value("${packport.db.enabled:false}") boolean dbEnabled
    ) {
        this.activeAdminSessionRepository = activeAdminSessionRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.securityEventService = securityEventService;
        this.dbEnabled = dbEnabled;
    }

    public static class SessionContext {
        public final String sessionId;
        public final String username;
        public final String ipAddress;
        public final String userAgent;
        public final String browser;
        public final String operatingSystem;

        public SessionContext(String sessionId, String username, String ipAddress, String userAgent, String browser, String operatingSystem) {
            this.sessionId = sessionId;
            this.username = username;
            this.ipAddress = ipAddress;
            this.userAgent = userAgent;
            this.browser = browser;
            this.operatingSystem = operatingSystem;
        }
    }

    @Transactional
    public ActiveAdminSessionEntity createSession(SessionContext ctx, OffsetDateTime now) {
        ActiveAdminSessionEntity entity = new ActiveAdminSessionEntity();
        entity.setSessionId(ctx.sessionId);
        entity.setUsername(ctx.username);
        entity.setLoginTime(now);
        entity.setLastActivity(now);
        entity.setIpAddress(ctx.ipAddress);
        entity.setUserAgent(ctx.userAgent);
        entity.setBrowser(ctx.browser);
        entity.setOperatingSystem(ctx.operatingSystem);
        // correlationId optional: set elsewhere if needed
        return activeAdminSessionRepository.save(entity);
    }

    @Transactional
    public void touchSession(String sessionId, OffsetDateTime now) {
        if (sessionId == null || sessionId.isBlank()) return;

        Optional<ActiveAdminSessionEntity> opt = activeAdminSessionRepository.findById(sessionId);
        if (opt.isEmpty()) return;

        ActiveAdminSessionEntity entity = opt.get();
        Duration idle = Duration.between(entity.getLastActivity(), now);
        if (idle.compareTo(SESSION_INACTIVITY_TIMEOUT) > 0) {
            expireSessionInternal(entity, now);
            return;
        }

        entity.setLastActivity(now);
        activeAdminSessionRepository.save(entity);
    }

    @Transactional
    public void terminateSession(String sessionId, OffsetDateTime now) {
        if (sessionId == null || sessionId.isBlank()) return;
        Optional<ActiveAdminSessionEntity> opt = activeAdminSessionRepository.findById(sessionId);
        if (opt.isEmpty()) return;

        ActiveAdminSessionEntity entity = opt.get();
        // Persist terminal event as a security event via SecurityEventService (used for security center).
        securityEventService.recordEvent(
                "SESSION_TERMINATED",
                entity.getUsername(),
                entity.getIpAddress(),
                entity.getUserAgent(),
                entity.getBrowser(),
                entity.getOperatingSystem(),
                "INFO",
                "Admin session terminated",
                null
        );

        activeAdminSessionRepository.delete(entity);
    }

    @Transactional
    public void expireSessionInternal(ActiveAdminSessionEntity entity, OffsetDateTime now) {
        if (entity == null) return;

        securityEventService.recordEvent(
                "SESSION_EXPIRED",
                entity.getUsername(),
                entity.getIpAddress(),
                entity.getUserAgent(),
                entity.getBrowser(),
                entity.getOperatingSystem(),
                "WARN",
                "Admin session expired due to inactivity",
                entity.getCorrelationId()
        );

        activeAdminSessionRepository.delete(entity);
    }

    @Scheduled(fixedDelayString = "${packport.security.session.expire-check-ms:60000}")
    @Transactional
    public void expireInactiveSessions() {
        if (!dbEnabled) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        // Iterate all sessions (expected to be small admin sessions).
        for (ActiveAdminSessionEntity entity : activeAdminSessionRepository.findAll()) {
            Duration idle = Duration.between(entity.getLastActivity(), now);
            if (idle.compareTo(SESSION_INACTIVITY_TIMEOUT) > 0) {
                expireSessionInternal(entity, now);
            }
        }
    }

    public PagedResponse<ActiveAdminSessionEntity> findSessions(
            int page,
            int pageSize,
            String sortBy,
            String sortDir,
            String search
    ) {
        Sort.Direction dir = Sort.Direction.fromString((sortDir == null || sortDir.isBlank()) ? "desc" : sortDir);
        String sortField = (sortBy == null || sortBy.isBlank()) ? "lastActivity" : sortBy;

        // Use repository paging with in-memory filtering for search.
        var pageable = PageRequest.of(Math.max(page, 0), Math.max(pageSize, 1), Sort.by(dir, sortField));
        var pageResult = activeAdminSessionRepository.findAll(pageable);

        String q = (search == null) ? null : search.trim().toLowerCase(Locale.ROOT);
        if (q == null || q.isBlank()) {
            return new PagedResponse<>(pageResult.getContent(), pageResult.getTotalElements(), pageResult.getNumber(), pageResult.getSize());
        }

        var filtered = pageResult.getContent().stream().filter(e ->
                (e.getSessionId() != null && e.getSessionId().toLowerCase(Locale.ROOT).contains(q)) ||
                        (e.getUsername() != null && e.getUsername().toLowerCase(Locale.ROOT).contains(q)) ||
                        (e.getIpAddress() != null && e.getIpAddress().toLowerCase(Locale.ROOT).contains(q)) ||
                        (e.getBrowser() != null && e.getBrowser().toLowerCase(Locale.ROOT).contains(q))
        ).toList();

        // Note: totalElements reported as filtered size because we don't have DB predicate here.
        return new PagedResponse<>(filtered, filtered.size(), pageable.getPageNumber(), pageable.getPageSize());
    }
}