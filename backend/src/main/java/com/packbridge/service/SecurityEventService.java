package com.packbridge.service;

import com.packbridge.dto.PagedResponse;
import com.packbridge.dto.SecurityStatisticsDto;
import com.packbridge.repository.SecurityEventRepository;
import com.packbridge.security.entity.SecurityEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.function.Predicate;

@Service
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;

    public SecurityEventService(SecurityEventRepository securityEventRepository) {
        this.securityEventRepository = securityEventRepository;
    }

    public SecurityStatisticsDto statistics() {
        SecurityStatisticsDto dto = new SecurityStatisticsDto();

        dto.setSecurityEvents(securityEventRepository.count());

        // Rollups will be made DB-backed later.
        // Keep stats compile-safe and consistent for now.
        dto.setFailedLogins(0L);
        dto.setSuccessfulLogins(0L);
        dto.setLockedAccounts(0L);
        dto.setActiveSessions(0L);

        return dto;
    }

    public void recordEvent(
            String eventType,
            String username,
            String ipAddress,
            String userAgent,
            String browser,
            String operatingSystem,
            String severity,
            String details,
            String correlationId
    ) {
        SecurityEventEntity e = new SecurityEventEntity();
        e.setEventType(eventType);
        e.setUsername(username);
        e.setIpAddress(ipAddress);
        e.setUserAgent(userAgent);
        e.setBrowser(browser);
        e.setOperatingSystem(operatingSystem);
        e.setSeverity(severity);
        e.setDetails(details);
        e.setOccurredAt(OffsetDateTime.now());
        e.setCorrelationId(correlationId);
        securityEventRepository.save(e);
    }

    public PagedResponse<SecurityEventEntity> findEvents(
            int page,
            int pageSize,
            String sortBy,
            String sortDir,
            String search,
            String severity,
            String eventType
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(pageSize, 1),
                Sort.by(Sort.Direction.fromString(sortDir == null ? "desc" : sortDir),
                        sortBy == null ? "occurredAt" : sortBy)
        );

        Page<SecurityEventEntity> pageResult = securityEventRepository.findAll(pageable);

        Predicate<SecurityEventEntity> predicate = entity -> {
            if (severity != null && !severity.isBlank()) {
                if (entity.getSeverity() == null || !entity.getSeverity().equalsIgnoreCase(severity)) return false;
            }
            if (eventType != null && !eventType.isBlank()) {
                if (entity.getEventType() == null || !entity.getEventType().equalsIgnoreCase(eventType)) return false;
            }
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase(Locale.ROOT);
                boolean match =
                        (entity.getEventType() != null && entity.getEventType().toLowerCase(Locale.ROOT).contains(q)) ||
                                (entity.getUsername() != null && entity.getUsername().toLowerCase(Locale.ROOT).contains(q)) ||
                                (entity.getIpAddress() != null && entity.getIpAddress().toLowerCase(Locale.ROOT).contains(q)) ||
                                (entity.getDetails() != null && entity.getDetails().toLowerCase(Locale.ROOT).contains(q));
                if (!match) return false;
            }
            return true;
        };

        List<SecurityEventEntity> filtered = pageResult.getContent().stream().filter(predicate).toList();
        PageImpl<SecurityEventEntity> filteredPage = new PageImpl<>(filtered, pageable, filtered.size());

        return new PagedResponse<>(
                filteredPage.getContent(),
                filteredPage.getTotalElements(),
                filteredPage.getNumber(),
                filteredPage.getSize()
        );
    }
}