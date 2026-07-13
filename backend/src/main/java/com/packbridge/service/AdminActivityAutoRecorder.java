package com.packbridge.service;

import com.packbridge.entity.AdminActivityEntity;
import com.packbridge.repository.AdminActivityRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AdminActivityAutoRecorder {

    private final AdminActivityRepository adminActivityRepository;

    public AdminActivityAutoRecorder(AdminActivityRepository adminActivityRepository) {
        this.adminActivityRepository = adminActivityRepository;
    }

    public void recordPageAccess(HttpServletRequest request, String correlationId, String path) {
        // Best-effort username extraction without changing authentication/session logic.
        String username = null;
        Object principal = request.getUserPrincipal() != null ? request.getUserPrincipal() : null;
        if (principal != null) username = principal.toString();

        OffsetDateTime now = OffsetDateTime.now();
        AdminActivityEntity e = new AdminActivityEntity();
        e.setId(UUID.randomUUID());
        e.setTimestampUtc(now);
        e.setUsername(username);
        e.setAction("VIEW_PAGE");
        e.setDescription("Viewed dashboard page: " + path);
        e.setIpAddress(request.getRemoteAddr());
        e.setBrowser(request.getHeader("User-Agent"));
        e.setOperatingSystem(null);
        e.setSessionId(request.getSession(false) != null ? request.getSession(false).getId() : null);
        e.setCorrelationId(correlationId);

        adminActivityRepository.save(e);
    }

    public void recordAction(String username, String action, String description, HttpServletRequest request, String correlationId) {
        OffsetDateTime now = OffsetDateTime.now();
        AdminActivityEntity e = new AdminActivityEntity();
        e.setId(UUID.randomUUID());
        e.setTimestampUtc(now);
        e.setUsername(username);
        e.setAction(action);
        e.setDescription(description);
        e.setIpAddress(request.getRemoteAddr());
        e.setBrowser(request.getHeader("User-Agent"));
        e.setOperatingSystem(null);
        e.setSessionId(request.getSession(false) != null ? request.getSession(false).getId() : null);
        e.setCorrelationId(correlationId);

        adminActivityRepository.save(e);
    }
}