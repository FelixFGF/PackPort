package com.packbridge.config;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextListener;

/**
 * Intentionally no-op.
 * Session cookie attributes (Secure/HttpOnly/SameSite) are configured via Spring Boot
 * application.properties using official server.servlet.session.cookie.* properties.
 */
public class SessionCookieConfig implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // no-op
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // no-op
    }
}