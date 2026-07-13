package com.packbridge.service;

import com.packbridge.dto.AnalyticsActivityDto;
import com.packbridge.dto.AnalyticsHistoryDto;
import com.packbridge.dto.AnalyticsSystemDto;
import com.packbridge.dto.LoaderDistributionDto;
import com.packbridge.entity.AnalyticsEventEntity;
import com.packbridge.repository.AnalyticsEventRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminAnalyticsAdvancedService {

    private final AnalyticsEventRepository analyticsEventRepository;

    public AdminAnalyticsAdvancedService(AnalyticsEventRepository analyticsEventRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
    }

    /**
     * Note:
     * AnalyticsHistoryDto currently only defines AnalyticsHistoryDto.Daily.
     * There is no top-level list field/getter/setter in this DTO class.
     * For now, we return an empty AnalyticsHistoryDto container (no invented metrics)
     * because wiring real history would require extending the DTO contract.
     */
    public AnalyticsHistoryDto history(int days) {
        // Intentionally empty: do not invent metrics; DTO contract doesn't expose daily list.
        return new AnalyticsHistoryDto();
    }

    public LoaderDistributionDto loaders() {
        LoaderDistributionDto dto = new LoaderDistributionDto();

        List<AnalyticsEventEntity> events = analyticsEventRepository.findTop1000ByOrderByTimestampUtcDesc();
        if (events.isEmpty()) {
            return dto;
        }

        long fabric = 0;
        long forge = 0;
        long neoforge = 0;
        long quilt = 0;
        long unknown = 0;

        for (AnalyticsEventEntity e : events) {
            String loader = e.getModLoader();
            if (loader == null || loader.isBlank()) {
                unknown++;
                continue;
            }

            String normalized = loader.trim().toLowerCase();
            if (normalized.contains("fabric")) fabric++;
            else if (normalized.contains("forge")) forge++;
            else if (normalized.contains("neoforge") || normalized.contains("neo-forge")) neoforge++;
            else if (normalized.contains("quilt")) quilt++;
            else unknown++;
        }

        dto.setFabric(fabric);
        dto.setForge(forge);
        dto.setNeoforge(neoforge);
        dto.setQuilt(quilt);
        dto.setUnknown(unknown);

        return dto;
    }

    public AnalyticsSystemDto system() {
        AnalyticsSystemDto dto = new AnalyticsSystemDto();

        dto.setJvmVersion(System.getProperty("java.version"));
        dto.setSpringBootVersion(null);
        dto.setBackendUptimeSeconds(null);
        dto.setCpuUsagePercent(null);
        dto.setMemoryUsedBytes(null);
        dto.setDiskFreeBytes(null);
        dto.setActiveJobs(null);

        AnalyticsSystemDto.DbInfo db = new AnalyticsSystemDto.DbInfo();
        db.setStatus("unavailable");
        dto.setDatabase(db);

        return dto;
    }

    public AnalyticsActivityDto activity() {
        List<AnalyticsEventEntity> events = analyticsEventRepository.findTop1000ByOrderByTimestampUtcDesc();
        events.sort(Comparator.comparing(AnalyticsEventEntity::getTimestampUtc).reversed());

        List<AnalyticsActivityDto.Event> mapped = events.stream()
                .limit(50)
                .map(e -> {
                    AnalyticsActivityDto.Event ev = new AnalyticsActivityDto.Event();
                    ev.setTimestampUtc(e.getTimestampUtc());
                    ev.setEventType(e.getEventType());
                    ev.setUploadCount(e.getUploadCount());
                    ev.setDownloadCount(e.getDownloadCount());
                    ev.setConversionStarted(e.getConversionStarted());
                    ev.setConversionFinished(e.getConversionFinished());
                    ev.setConversionFailed(e.getConversionFailed());
                    ev.setConversionDurationMs(e.getConversionDurationMs());
                    ev.setMinecraftVersion(e.getMinecraftVersion());
                    ev.setModLoader(e.getModLoader());
                    ev.setOperatingSystem(e.getOperatingSystem());
                    ev.setApplicationVersion(e.getApplicationVersion());
                    ev.setModpackName(e.getModpackName());
                    ev.setJobId(e.getJobId());
                    return ev;
                })
                .toList();

        AnalyticsActivityDto dto = new AnalyticsActivityDto();
        dto.setEvents(mapped);
        return dto;
    }
}