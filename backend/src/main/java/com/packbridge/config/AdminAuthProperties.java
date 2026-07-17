package com.packbridge.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class AdminAuthProperties {

    @Value("${ADMIN_USERNAME:}")
    private String username;

    @Value("${ADMIN_PASSWORD_HASH:}")
    private String passwordHash;

    private final Environment environment;

    public AdminAuthProperties(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    void validateAdminAuthConfig() {
        /*
         * Dev/local should be able to start without admin env vars so /api/health returns 200.
         *
         * Production should enable auth validation explicitly:
         * PACKPORT_REQUIRE_ADMIN_AUTH=true
         */
        boolean requireAdminAuth = environment.getProperty(
                "PACKPORT_REQUIRE_ADMIN_AUTH",
                "false"
        ).equalsIgnoreCase("true");

        if (!requireAdminAuth) {
            return;
        }

        // Fail fast: only environment variables are allowed (no defaults).
        if (username == null || username.isBlank()) {
            throw new IllegalStateException("Missing required environment variable: ADMIN_USERNAME");
        }
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalStateException("Missing required environment variable: ADMIN_PASSWORD_HASH");
        }

        // BCrypt hashes have known prefixes like:
        // $2a$, $2b$, $2y$, followed by cost and the hash parts.
        // This validation prevents the runtime error "Encoded password does not look like BCrypt".
        if (!looksLikeBcrypt(passwordHash)) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD_HASH is not a valid BCrypt hash. Expected prefix like $2a$/$2b$/$2y$"
            );
        }
    }

    private static boolean looksLikeBcrypt(String hash) {
        // Examples:
        // $2a$10$..............................................
        // $2b$12$..............................................
        // $2y$10$..............................................
        return hash.matches("^\\$(2a|2b|2y)\\$\\d{2}\\$[./A-Za-z0-9]{53}$");
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}