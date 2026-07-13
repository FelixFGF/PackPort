package com.packbridge.dto;

public class AnalyticsSystemDto {

    public static class JvmInfo {
        private String version;

        // bytes (nullable if cannot be measured)
        private Long maxMemoryBytes;
        private Long totalMemoryBytes;
        private Long freeMemoryBytes;

        public String getVersion() {
            return version;
        }

        public void setVersion(String version) {
            this.version = version;
        }

        public Long getMaxMemoryBytes() {
            return maxMemoryBytes;
        }

        public void setMaxMemoryBytes(Long maxMemoryBytes) {
            this.maxMemoryBytes = maxMemoryBytes;
        }

        public Long getTotalMemoryBytes() {
            return totalMemoryBytes;
        }

        public void setTotalMemoryBytes(Long totalMemoryBytes) {
            this.totalMemoryBytes = totalMemoryBytes;
        }

        public Long getFreeMemoryBytes() {
            return freeMemoryBytes;
        }

        public void setFreeMemoryBytes(Long freeMemoryBytes) {
            this.freeMemoryBytes = freeMemoryBytes;
        }
    }

    public static class DbInfo {
        private String status; // e.g. "available" / "unavailable"

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    private Long backendUptimeSeconds;
    private String jvmVersion;
    private String springBootVersion;

    private Long cpuUsagePercent; // nullable
    private Long memoryUsedBytes; // nullable
    private Long diskFreeBytes; // nullable

    private Long activeJobs; // nullable
    private DbInfo database = new DbInfo();

    public Long getBackendUptimeSeconds() {
        return backendUptimeSeconds;
    }

    public void setBackendUptimeSeconds(Long backendUptimeSeconds) {
        this.backendUptimeSeconds = backendUptimeSeconds;
    }

    public String getJvmVersion() {
        return jvmVersion;
    }

    public void setJvmVersion(String jvmVersion) {
        this.jvmVersion = jvmVersion;
    }

    public String getSpringBootVersion() {
        return springBootVersion;
    }

    public void setSpringBootVersion(String springBootVersion) {
        this.springBootVersion = springBootVersion;
    }

    public Long getCpuUsagePercent() {
        return cpuUsagePercent;
    }

    public void setCpuUsagePercent(Long cpuUsagePercent) {
        this.cpuUsagePercent = cpuUsagePercent;
    }

    public Long getMemoryUsedBytes() {
        return memoryUsedBytes;
    }

    public void setMemoryUsedBytes(Long memoryUsedBytes) {
        this.memoryUsedBytes = memoryUsedBytes;
    }

    public Long getDiskFreeBytes() {
        return diskFreeBytes;
    }

    public void setDiskFreeBytes(Long diskFreeBytes) {
        this.diskFreeBytes = diskFreeBytes;
    }

    public Long getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(Long activeJobs) {
        this.activeJobs = activeJobs;
    }

    public DbInfo getDatabase() {
        return database;
    }

    public void setDatabase(DbInfo database) {
        this.database = database;
    }
}