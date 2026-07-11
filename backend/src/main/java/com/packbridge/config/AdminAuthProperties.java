package com.packbridge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AdminAuthProperties {

    @Value("${ADMIN_USERNAME:admin}")
    private String username;

    @Value("${ADMIN_PASSWORD_HASH:$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH}")
    private String passwordHash;

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}