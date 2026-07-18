package com.packbridge.activity;

import com.packbridge.config.CorrelationIdFilter;
import com.packbridge.service.AdminActivityAutoRecorder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

public class AdminActivityRecorderFilter extends OncePerRequestFilter {

    private final AdminActivityAutoRecorder recorder;

    public AdminActivityRecorderFilter(AdminActivityAutoRecorder recorder) {
        this.recorder = recorder;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only record dashboard page accesses (GET)
        boolean isDashboardGet =
                HttpMethod.GET.matches(request.getMethod()) &&
                path != null &&
                path.startsWith("/api/admin/") &&
                (path.equals("/api/admin") || path.startsWith("/api/admin/") || "/api/admin".equals(path));

        try {
            filterChain.doFilter(request, response);
        } finally {
            if (isDashboardGet) {
                String correlationId = (String) request.getAttribute(CorrelationIdFilter.CORRELATION_ID_ATTR);
                recorder.recordPageAccess(request, correlationId, path);
            }
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return false;
    }
}
