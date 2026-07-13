package com.packbridge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    public static final String CORRELATION_ID_ATTR = CorrelationIdFilter.class.getName() + ".correlationId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String incoming = Optional.ofNullable(request.getHeader(CORRELATION_ID_HEADER)).orElse(null);
            String correlationId = (incoming == null || incoming.isBlank()) ? UUID.randomUUID().toString() : incoming;

            request.setAttribute(CORRELATION_ID_ATTR, correlationId);
            response.setHeader(CORRELATION_ID_HEADER, correlationId);

            filterChain.doFilter(request, response);
        } finally {
            // no threadlocals used, request-scoped attribute is enough
        }
    }

    public static String getCorrelationId(HttpServletRequest request) {
        Object v = request.getAttribute(CORRELATION_ID_ATTR);
        return v == null ? null : String.valueOf(v);
    }
}