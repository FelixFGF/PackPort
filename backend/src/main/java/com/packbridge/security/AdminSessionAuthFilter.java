package com.packbridge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AdminSessionAuthFilter extends OncePerRequestFilter {

    public static final String SESSION_ATTR_AUTHENTICATED = "ADMIN_AUTHENTICATED";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Only protect /api/admin/**
        if (path == null || !path.startsWith("/api/admin/") && !"/api/admin".equals(path)) {
            return true;
        }

        // Exempted endpoints
        if ("/api/admin/login".equals(path) && "POST".equalsIgnoreCase(request.getMethod())) return true;
        if ("/api/admin/session".equals(path) && "GET".equalsIgnoreCase(request.getMethod())) return true;
        if ("/api/admin/logout".equals(path) && "POST".equalsIgnoreCase(request.getMethod())) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        HttpServletRequest req = request;

        Object authenticated = req.getSession(false) != null
                ? req.getSession(false).getAttribute(SESSION_ATTR_AUTHENTICATED)
                : null;

        boolean isAuthenticated = Boolean.TRUE.equals(authenticated);

        if (!isAuthenticated) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"success\":false,\"message\":\"Unauthorized\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}