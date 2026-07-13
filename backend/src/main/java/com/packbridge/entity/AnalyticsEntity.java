package com.packbridge.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "analytics_metrics")
public class AnalyticsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;

    @Column(name = "visitors_total", nullable = false)
    private Long visitorsTotal;

    @Column(name = "visitors_today", nullable = false)
    private Long visitorsToday;

    @Column(name = "active_users", nullable = false)
    private Long activeUsers;

    @Column(name = "conversions_total", nullable = false)
    private Long conversionsTotal;

    @Column(name = "conversions_successful", nullable = false)
    private Long conversionsSuccessful;

    @Column(name = "conversions_failed", nullable = false)
    private Long conversionsFailed;

    @Column(name = "average_conversion_duration_ms", nullable = false)
    private Long averageConversionDurationMs;

    @Column(name = "uploads", nullable = false)
    private Long uploads;

    @Column(name = "downloads", nullable = false)
    private Long downloads;

    @Column(name = "running_jobs", nullable = false)
    private Long runningJobs;

    @Column(name = "backend_uptime_seconds", nullable = false)
    private Long backendUptimeSeconds;

    @PrePersist
    void prePersist() {
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }

    public Long getVisitorsTotal() {
        return visitorsTotal;
    }

    public void setVisitorsTotal(Long visitorsTotal) {
        this.visitorsTotal = visitorsTotal;
    }

    public Long getVisitorsToday() {
        return visitorsToday;
    }

    public void setVisitorsToday(Long visitorsToday) {
        this.visitorsToday = visitorsToday;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public Long getConversionsTotal() {
        return conversionsTotal;
    }

    public void setConversionsTotal(Long conversionsTotal) {
        this.conversionsTotal = conversionsTotal;
    }

    public Long getConversionsSuccessful() {
        return conversionsSuccessful;
    }

    public void setConversionsSuccessful(Long conversionsSuccessful) {
        this.conversionsSuccessful = conversionsSuccessful;
    }

    public Long getConversionsFailed() {
        return conversionsFailed;
    }

    public void setConversionsFailed(Long conversionsFailed) {
        this.conversionsFailed = conversionsFailed;
    }

    public Long getAverageConversionDurationMs() {
        return averageConversionDurationMs;
    }

    public void setAverageConversionDurationMs(Long averageConversionDurationMs) {
        this.averageConversionDurationMs = averageConversionDurationMs;
    }

    public Long getUploads() {
        return uploads;
    }

    public void setUploads(Long uploads) {
        this.uploads = uploads;
    }

    public Long getDownloads() {
        return downloads;
    }

    public void setDownloads(Long downloads) {
        this.downloads = downloads;
    }

    public Long getRunningJobs() {
        return runningJobs;
    }

    public void setRunningJobs(Long runningJobs) {
        this.runningJobs = runningJobs;
    }

    public Long getBackendUptimeSeconds() {
        return backendUptimeSeconds;
    }

    public void setBackendUptimeSeconds(Long backendUptimeSeconds) {
        this.backendUptimeSeconds = backendUptimeSeconds;
    }
}