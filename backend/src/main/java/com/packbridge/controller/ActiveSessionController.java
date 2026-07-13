package com.packbridge.controller;

import com.packbridge.dto.PagedResponse;
import com.packbridge.security.entity.ActiveAdminSessionEntity;
import com.packbridge.service.ActiveSessionService;
import com.packbridge.service.SecurityEventService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/security")
public class ActiveSessionController {

    private final ActiveSessionService activeSessionService;
    private final SecurityEventService securityEventService;

    public ActiveSessionController(ActiveSessionService activeSessionService, SecurityEventService securityEventService) {
        this.activeSessionService = activeSessionService;
        this.securityEventService = securityEventService;
    }

    @GetMapping(value = "/sessions", produces = MediaType.APPLICATION_JSON_VALUE)
    public PagedResponse<ActiveAdminSessionEntity> sessions(
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "pageSize", required = false, defaultValue = "20") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "sortDir", required = false) String sortDir,
            @RequestParam(name = "search", required = false) String search
    ) {
        return activeSessionService.findSessions(page, pageSize, sortBy, sortDir, search);
    }

    @DeleteMapping(value = "/sessions/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody Object terminateSession(
            @PathVariable("id") String id,
            HttpServletRequest request
    ) {
        // Correlation ID reuse via existing correlation header/filter attribute.
        // If correlation id isn't present, pass null (DB column is nullable).
        String correlationId = (String) request.getAttribute("CORRELATION_ID");
        if (correlationId == null) {
            correlationId = request.getHeader("X-Correlation-Id");
        }

        activeSessionService.terminateSession(id, java.time.OffsetDateTime.now());

        // Record Admin Activity entry (existing admin activity via AdminActivityRecorderFilter)
        // For compatibility, we persist security terminal event in ActiveSessionService via SecurityEventService.
        // Standard response wrapper used in this project is simple {"success": true}.
        return java.util.Map.of("success", true);
    }
}