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

        // Cross-origin cookies (Netlify -> Render) require Secure + SameSite=None.
        // Secure must be true when SameSite=None is used.
        cookieConfig.setSecure(true);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // no-op
    }
}