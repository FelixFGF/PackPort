package com.packbridge.controller;

import com.packbridge.dto.PagedResponse;
import com.packbridge.dto.SecurityStatisticsDto;
import com.packbridge.security.entity.SecurityEventEntity;
import com.packbridge.service.SecurityEventService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/security")
public class SecurityEventController {

    private final SecurityEventService securityEventService;

    public SecurityEventController(SecurityEventService securityEventService) {
        this.securityEventService = securityEventService;
    }

    @GetMapping(value = "/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
    public SecurityStatisticsDto statistics() {
        return securityEventService.statistics();
    }

    @GetMapping(value = "/events", produces = MediaType.APPLICATION_JSON_VALUE)
    public PagedResponse<SecurityEventEntity> events(
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "pageSize", required = false, defaultValue = "20") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "sortDir", required = false) String sortDir,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "severity", required = false) String severity,
            @RequestParam(name = "eventType", required = false) String eventType
    ) {
        return securityEventService.findEvents(page, pageSize, sortBy, sortDir, search, severity, eventType);
    }
}