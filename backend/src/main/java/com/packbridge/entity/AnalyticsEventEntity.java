package com.packbridge.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp_utc", nullable = false)
    private Instant timestampUtc;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "upload_count")
    private Long uploadCount;

    @Column(name = "download_count")
    private Long downloadCount;

    @Column(name = "conversion_started")
    private Boolean conversionStarted;

    @Column(name = "conversion_finished")
    private Boolean conversionFinished;

    @Column(name = "conversion_failed")
    private Boolean conversionFailed;

    @Column(name = "conversion_duration_ms")
    private Long conversionDurationMs;

    @Column(name = "minecraft_version")
    private String minecraftVersion;

    @Column(name = "mod_loader")
    private String modLoader;

    @Column(name = "operating_system")
    private String operatingSystem;

    @Column(name = "application_version")
    private String applicationVersion;

    @Column(name = "modpack_name")
    private String modpackName;

    @Column(name = "job_id")
    private String jobId;

    @PrePersist
    void prePersist() {
        if (timestampUtc == null) {
            timestampUtc = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Instant getTimestampUtc() {
        return timestampUtc;
    }

    public String getEventType() {
        return eventType;
    }

    public Long getUploadCount() {
        return uploadCount;
    }

    public Long getDownloadCount() {
        return downloadCount;
    }

    public Boolean getConversionStarted() {
        return conversionStarted;
    }

    public Boolean getConversionFinished() {
        return conversionFinished;
    }

    public Boolean getConversionFailed() {
        return conversionFailed;
    }

    public Long getConversionDurationMs() {
        return conversionDurationMs;
    }

    public String getMinecraftVersion() {
        return minecraftVersion;
    }

    public String getModLoader() {
        return modLoader;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public String getApplicationVersion() {
        return applicationVersion;
    }

    public String getModpackName() {
        return modpackName;
    }

    public String getJobId() {
        return jobId;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public void setUploadCount(Long uploadCount) {
        this.uploadCount = uploadCount;
    }

    public void setDownloadCount(Long downloadCount) {
        this.downloadCount = downloadCount;
    }

    public void setConversionStarted(Boolean conversionStarted) {
        this.conversionStarted = conversionStarted;
    }

    public void setConversionFinished(Boolean conversionFinished) {
        this.conversionFinished = conversionFinished;
    }

    public void setConversionFailed(Boolean conversionFailed) {
        this.conversionFailed = conversionFailed;
    }

    public void setConversionDurationMs(Long conversionDurationMs) {
        this.conversionDurationMs = conversionDurationMs;
    }

    public void setMinecraftVersion(String minecraftVersion) {
        this.minecraftVersion = minecraftVersion;
    }

    public void setModLoader(String modLoader) {
        this.modLoader = modLoader;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public void setApplicationVersion(String applicationVersion) {
        this.applicationVersion = applicationVersion;
    }

    public void setModpackName(String modpackName) {
        this.modpackName = modpackName;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
}