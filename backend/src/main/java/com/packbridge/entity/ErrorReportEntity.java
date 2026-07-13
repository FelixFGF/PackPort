package com.packbridge.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "error_reports")
public class ErrorReportEntity {

    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "timestamp_utc", nullable = false)
    private Instant timestampUtc;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "error_message", nullable = false)
    private String errorMessage;

    @Lob
    @Column(name = "stacktrace", nullable = false)
    private String stacktrace;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(name = "job_id")
    private String jobId;

    @Column(name = "browser")
    private String browser;

    @Column(name = "operating_system")
    private String operatingSystem;

    @Column(name = "minecraft_version")
    private String minecraftVersion;

    @Column(name = "loader")
    private String loader;

    @Column(name = "modpack_name")
    private String modpackName;

    @Lob
    @Column(name = "installed_mods")
    private String installedMods;

    @Column(name = "application_version")
    private String applicationVersion;

    @Lob
    @Column(name = "logs")
    private String logs;

    @Lob
    @Column(name = "user_notes")
    private String userNotes;

    @Column(name = "resolved", nullable = false)
    private boolean resolved;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @PrePersist
    void prePersist() {
        if (timestampUtc == null) {
            timestampUtc = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public Instant getTimestampUtc() {
        return timestampUtc;
    }

    public String getSeverity() {
        return severity;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getStacktrace() {
        return stacktrace;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public String getJobId() {
        return jobId;
    }

    public String getBrowser() {
        return browser;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public String getMinecraftVersion() {
        return minecraftVersion;
    }

    public String getLoader() {
        return loader;
    }

    public String getModpackName() {
        return modpackName;
    }

    public String getInstalledMods() {
        return installedMods;
    }

    public String getApplicationVersion() {
        return applicationVersion;
    }

    public String getLogs() {
        return logs;
    }

    public String getUserNotes() {
        return userNotes;
    }

    public boolean isResolved() {
        return resolved;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setTimestampUtc(Instant timestampUtc) {
        this.timestampUtc = timestampUtc;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public void setStacktrace(String stacktrace) {
        this.stacktrace = stacktrace;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public void setBrowser(String browser) {
        this.browser = browser;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public void setMinecraftVersion(String minecraftVersion) {
        this.minecraftVersion = minecraftVersion;
    }

    public void setLoader(String loader) {
        this.loader = loader;
    }

    public void setModpackName(String modpackName) {
        this.modpackName = modpackName;
    }

    public void setInstalledMods(String installedMods) {
        this.installedMods = installedMods;
    }

    public void setApplicationVersion(String applicationVersion) {
        this.applicationVersion = applicationVersion;
    }

    public void setLogs(String logs) {
        this.logs = logs;
    }

    public void setUserNotes(String userNotes) {
        this.userNotes = userNotes;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
