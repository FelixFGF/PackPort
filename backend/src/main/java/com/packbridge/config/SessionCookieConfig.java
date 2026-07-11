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

        boolean secureCookies =
                "true".equalsIgnoreCase(System.getenv("SECURE_COOKIES"))
                        || System.getenv("RENDER") != null;

        cookieConfig.setSecure(secureCookies);

        // Best-effort: SameSite=Lax support varies by servlet container.
        servletContext.setAttribute("sessionSameSite", "Lax");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // no-op
    }
}