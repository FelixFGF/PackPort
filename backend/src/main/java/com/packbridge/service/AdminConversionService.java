package com.packbridge.service;

import com.packbridge.dto.ConversionDto;
import com.packbridge.entity.AnalyticsEventEntity;
import com.packbridge.repository.AnalyticsEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AdminConversionService {

    private final AnalyticsEventRepository analyticsEventRepository;

    public AdminConversionService(AnalyticsEventRepository analyticsEventRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
    }

    public Page<ConversionDto> findConversions(
            String search,
            String modpackName,
            String loader,
            String status,
            Instant from,
            Instant to,
            Pageable pageable
    ) {
        // Repository currently only supports a few "top" list methods.
        // We'll implement filtering/paging by pulling a bounded window using timestamp range if possible,
        // then paginating in-memory via the supplied Pageable.
        // This still uses PostgreSQL persisted analytics_events data (no mock), but avoids adding a
        // complex query right now because repository query edits are currently failing tool-side.

        // Build a conservative time window:
        Instant start = from != null ? from : Instant.now().minusSeconds(30L * 24L * 3600L);
        Instant end = to != null ? to : Instant.now().plusSeconds(60);

        List<AnalyticsEventEntity> window = analyticsEventRepository
                .findTop500ByTimestampUtcBetweenOrderByTimestampUtcDesc(start, end);

        // Convert + filter:
        String s = (search == null || search.isBlank()) ? null : search.trim().toLowerCase();
        String mp = (modpackName == null || modpackName.isBlank()) ? null : modpackName.trim().toLowerCase();
        String ld = (loader == null || loader.isBlank()) ? null : loader.trim().toLowerCase();
        String st = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();

        List<ConversionDto> all = window.stream()
                .filter(e -> e.getConversionStarted() != null || e.getConversionFinished() != null || e.getConversionFailed() != null)
                .filter(e -> {
                    if (mp != null) {
                        String v = e.getModpackName();
                        if (v == null || !v.trim().equalsIgnoreCase(modpackName.trim())) return false;
                    }
                    if (ld != null) {
                        String v = e.getModLoader();
                        if (v == null || !v.toLowerCase().contains(ld)) return false;
                    }
                    if (st != null) {
                        boolean ok = switch (st) {
                            case "STARTED" -> Boolean.TRUE.equals(e.getConversionStarted());
                            case "FINISHED" -> Boolean.TRUE.equals(e.getConversionFinished());
                            case "FAILED" -> Boolean.TRUE.equals(e.getConversionFailed());
                            default -> true;
                        };
                        if (!ok) return false;
                    }
                    if (s != null) {
                        String mpn = e.getModpackName() == null ? "" : e.getModpackName().toLowerCase();
                        String jid = e.getJobId() == null ? "" : e.getJobId().toLowerCase();
                        String mv = e.getMinecraftVersion() == null ? "" : e.getMinecraftVersion().toLowerCase();
                        return mpn.contains(s) || jid.contains(s) || mv.contains(s);
                    }
                    return true;
                })
                .map(this::map)
                .toList();

        int total = all.size();
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();

        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);

        List<ConversionDto> items = fromIndex >= toIndex ? List.of() : all.subList(fromIndex, toIndex);

        return new org.springframework.data.domain.PageImpl<>(items, pageable, total);
    }

    private ConversionDto map(AnalyticsEventEntity e) {
        ConversionDto dto = new ConversionDto();
        dto.jobId = e.getJobId();
        dto.timestampUtc = e.getTimestampUtc();
        dto.modpackName = e.getModpackName();
        dto.minecraftVersion = e.getMinecraftVersion();
        dto.loader = e.getModLoader();
        dto.operatingSystem = e.getOperatingSystem();

        dto.conversionStarted = Boolean.TRUE.equals(e.getConversionStarted());
        dto.conversionFinished = Boolean.TRUE.equals(e.getConversionFinished());
        dto.conversionFailed = Boolean.TRUE.equals(e.getConversionFailed());

        dto.conversionDurationMs = e.getConversionDurationMs();

        if (dto.conversionFailed) dto.status = "FAILED";
        else if (dto.conversionFinished) dto.status = "FINISHED";
        else if (dto.conversionStarted) dto.status = "STARTED";
        else dto.status = "UNKNOWN";

        return dto;
    }
}