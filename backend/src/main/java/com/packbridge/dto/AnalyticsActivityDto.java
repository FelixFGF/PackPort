package com.packbridge.dto;

import java.time.Instant;
import java.util.List;

public class AnalyticsActivityDto {

    public static class Event {
        private Instant timestampUtc;
        private String eventType;

        private Long uploadCount;
        private Long downloadCount;

        private Boolean conversionStarted;
        private Boolean conversionFinished;
        private Boolean conversionFailed;

        private Long conversionDurationMs;

        private String minecraftVersion;
        private String modLoader;
        private String operatingSystem;
        private String applicationVersion;
        private String modpackName;
        private String jobId;

        public Instant getTimestampUtc() {
            return timestampUtc;
        }

        public void setTimestampUtc(Instant timestampUtc) {
            this.timestampUtc = timestampUtc;
        }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }

        public Long getUploadCount() {
            return uploadCount;
        }

        public void setUploadCount(Long uploadCount) {
            this.uploadCount = uploadCount;
        }

        public Long getDownloadCount() {
            return downloadCount;
        }

        public void setDownloadCount(Long downloadCount) {
            this.downloadCount = downloadCount;
        }

        public Boolean getConversionStarted() {
            return conversionStarted;
        }

        public void setConversionStarted(Boolean conversionStarted) {
            this.conversionStarted = conversionStarted;
        }

        public Boolean getConversionFinished() {
            return conversionFinished;
        }

        public void setConversionFinished(Boolean conversionFinished) {
            this.conversionFinished = conversionFinished;
        }

        public Boolean getConversionFailed() {
            return conversionFailed;
        }

        public void setConversionFailed(Boolean conversionFailed) {
            this.conversionFailed = conversionFailed;
        }

        public Long getConversionDurationMs() {
            return conversionDurationMs;
        }

        public void setConversionDurationMs(Long conversionDurationMs) {
            this.conversionDurationMs = conversionDurationMs;
        }

        public String getMinecraftVersion() {
            return minecraftVersion;
        }

        public void setMinecraftVersion(String minecraftVersion) {
            this.minecraftVersion = minecraftVersion;
        }

        public String getModLoader() {
            return modLoader;
        }

        public void setModLoader(String modLoader) {
            this.modLoader = modLoader;
        }

        public String getOperatingSystem() {
            return operatingSystem;
        }

        public void setOperatingSystem(String operatingSystem) {
            this.operatingSystem = operatingSystem;
        }

        public String getApplicationVersion() {
            return applicationVersion;
        }

        public void setApplicationVersion(String applicationVersion) {
            this.applicationVersion = applicationVersion;
        }

        public String getModpackName() {
            return modpackName;
        }

        public void setModpackName(String modpackName) {
            this.modpackName = modpackName;
        }

        public String getJobId() {
            return jobId;
        }

        public void setJobId(String jobId) {
            this.jobId = jobId;
        }
    }

    private List<Event> events;

    public AnalyticsActivityDto() {
    }

    public AnalyticsActivityDto(List<Event> events) {
        this.events = events;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }
}