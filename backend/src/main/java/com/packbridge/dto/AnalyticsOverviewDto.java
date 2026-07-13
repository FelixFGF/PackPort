package com.packbridge.dto;

public record AnalyticsOverviewDto(
        long totalVisitors,
        long visitorsToday,
        long activeUsers,
        long totalConversions,
        long successfulConversions,
        long failedConversions,
        long averageConversionTime,
        long uploads,
        long downloads,
        long runningJobs,
        long backendUptime
) {
}