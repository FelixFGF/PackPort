package com.packbridge.service;

import com.packbridge.dto.AnalyticsOverviewDto;
import com.packbridge.entity.AnalyticsEntity;
import com.packbridge.repository.AnalyticsRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public AnalyticsOverviewDto getOverview() {
        AnalyticsEntity latest = analyticsRepository.findAll().stream()
                .max(Comparator.comparing(AnalyticsEntity::getRecordedAt))
                .orElse(null);

        if (latest == null) {
            // No analytics records yet in DB. Return zeros; still “real” data from DB (empty state).
            return new AnalyticsOverviewDto(
                    0L, 0L, 0L,
                    0L, 0L, 0L,
                    0L,
                    0L, 0L,
                    0L,
                    0L
            );
        }

        long uptimeSeconds = latest.getBackendUptimeSeconds();
        return new AnalyticsOverviewDto(
                latest.getVisitorsTotal(),
                latest.getVisitorsToday(),
                latest.getActiveUsers(),
                latest.getConversionsTotal(),
                latest.getConversionsSuccessful(),
                latest.getConversionsFailed(),
                latest.getAverageConversionDurationMs(),
                latest.getUploads(),
                latest.getDownloads(),
                latest.getRunningJobs(),
                uptimeSeconds
        );
    }
}