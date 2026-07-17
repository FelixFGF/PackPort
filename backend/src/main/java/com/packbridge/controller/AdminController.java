package com.packbridge.controller;

import com.packbridge.config.AdminAuthProperties;
import com.packbridge.service.AdminActivityAutoRecorder;
import com.packbridge.service.ActiveSessionService;
import com.packbridge.service.LoginAttemptService;
import com.packbridge.service.RequestCorrelation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String SESSION_ATTR_AUTHENTICATED = "ADMIN_AUTHENTICATED";

    private final AdminAuthProperties adminAuthProperties;
    private final PasswordEncoder passwordEncoder;

    private final LoginAttemptService loginAttemptService;
    private final ActiveSessionService activeSessionService;
    private final AdminActivityAutoRecorder adminActivityAutoRecorder;

    public AdminController(
            AdminAuthProperties adminAuthProperties,
            PasswordEncoder passwordEncoder,
            LoginAttemptService loginAttemptService,
            ActiveSessionService activeSessionService,
            AdminActivityAutoRecorder adminActivityAutoRecorder
    ) {
        this.adminAuthProperties = adminAuthProperties;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptService = loginAttemptService;
        this.activeSessionService = activeSessionService;
        this.adminActivityAutoRecorder = adminActivityAutoRecorder;
    }

    @PostMapping(
            value = "/login",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        String username = body.get("username") != null ? body.get("username").toString() : null;
        String password = body.get("password") != null ? body.get("password").toString() : null;

        if (username == null || password == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid username or password."
            ));
        }

        boolean usernameMatches = username.equals(adminAuthProperties.getUsername());
        boolean passwordMatches = passwordEncoder.matches(password, adminAuthProperties.getPasswordHash());

        // TEMP DEBUG logging for admin login failures (DO NOT log password or BCrypt hash)
        System.out.printf(
                "[ADMIN_LOGIN_DEBUG] loadedAdminUsername=%s usernameMatches=%s passwordMatches=%s%n",
                adminAuthProperties.getUsername(),
                usernameMatches,
                passwordMatches
        );

        RequestCorrelation correlation = new RequestCorrelation(request);

        String clientIp = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String browser = null;
        String operatingSystem = null;

        if (!usernameMatches || !passwordMatches) {
            int failedAttemptsSoFar = loginAttemptService.countFailedAttemptsSoFar(username, clientIp) + 1;

            loginAttemptService.recordFailedLogin(
                    username,
                    clientIp,
                    userAgent,
                    browser,
                    operatingSystem,
                    correlation.getCorrelationId(),
                    "Invalid username or password",
                    failedAttemptsSoFar
            );

            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid username or password."
            ));
        }

        loginAttemptService.recordSuccessfulLogin(
                username,
                clientIp,
                userAgent,
                browser,
                operatingSystem,
                correlation.getCorrelationId()
        );

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession newSession = request.getSession(true);
        newSession.setAttribute(SESSION_ATTR_AUTHENTICATED, true);

        OffsetDateTime now = OffsetDateTime.now();

        ActiveSessionService.SessionContext ctx = new ActiveSessionService.SessionContext(
                newSession.getId(),
                username,
                clientIp,
                userAgent,
                browser,
                operatingSystem
        );
        activeSessionService.createSession(ctx, now);

        adminActivityAutoRecorder.recordAction(
                username,
                "LOGIN",
                "Admin login",
                request,
                correlation.getCorrelationId()
        );

        activeSessionService.touchSession(newSession.getId(), now);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping(value = "/session", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> session(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        boolean authenticated = session != null && Boolean.TRUE.equals(session.getAttribute(SESSION_ATTR_AUTHENTICATED));
        return ResponseEntity.ok(Map.of("authenticated", authenticated));
    }

    @PostMapping(value = "/logout", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        RequestCorrelation correlation = new RequestCorrelation(request);

        HttpSession session = request.getSession(false);
        String sessionId = session != null ? session.getId() : null;

        String username = adminAuthProperties.getUsername();

        if (sessionId != null) {
            adminActivityAutoRecorder.recordAction(
                    username,
                    "LOGOUT",
                    "Admin logout",
                    request,
                    correlation.getCorrelationId()
            );

            activeSessionService.terminateSession(sessionId, OffsetDateTime.now());
        }

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(Map.of("success", true));
    }
}
