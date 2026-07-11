package com.packbridge.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class AdminAuthProperties {

    @Value("${ADMIN_USERNAME:admin}")
    private String username;

    @Value("${ADMIN_PASSWORD_HASH:$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH}")
    private String passwordHash;

    private final Environment environment;

    public AdminAuthProperties(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    void logAdminAuthConfigResolution() {
        // Do NOT print the actual password hash.
        boolean usernamePresent = environment.containsProperty("ADMIN_USERNAME");
        boolean passwordHashPresent = environment.containsProperty("ADMIN_PASSWORD_HASH");

        System.out.println("[AdminAuth] ADMIN_USERNAME loaded: " + usernamePresent);
        System.out.println("[AdminAuth] ADMIN_PASSWORD_HASH loaded: " + passwordHashPresent);
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}