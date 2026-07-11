package com.packbridge.controller;

import com.packbridge.config.AdminAuthProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String SESSION_ATTR_AUTHENTICATED = "ADMIN_AUTHENTICATED";

    private final AdminAuthProperties adminAuthProperties;
    private final PasswordEncoder passwordEncoder;

    public AdminController(AdminAuthProperties adminAuthProperties, PasswordEncoder passwordEncoder) {
        this.adminAuthProperties = adminAuthProperties;
        this.passwordEncoder = passwordEncoder;
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

        if (!usernameMatches || !passwordMatches) {
            // Same generic message; do not reveal which part failed.
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid username or password."
            ));
        }

        // Session fixation protection: rotate session id immediately after successful login.
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession newSession = request.getSession(true);
        newSession.setAttribute(SESSION_ATTR_AUTHENTICATED, true);

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
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}