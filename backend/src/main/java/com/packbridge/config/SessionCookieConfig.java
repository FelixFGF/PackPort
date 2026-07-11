package com.packbridge.config;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

public class SessionCookieConfig implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext servletContext = sce.getServletContext();
        jakarta.servlet.SessionCookieConfig cookieConfig = servletContext.getSessionCookieConfig();

        cookieConfig.setHttpOnly(true);

        // Cross-origin session cookies (Netlify -> Render) require SameSite=None + Secure=true.
        // Otherwise browsers may not include JSESSIONID on the subsequent GET /api/admin/session call.
        cookieConfig.setSecure(true);

        // Best-effort: set SameSite attribute for common servlet container implementations.
        servletContext.setAttribute("sessionSameSite", "None");
        servletContext.setAttribute("sessionCookieSameSite", "None");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // no-op
    }
}