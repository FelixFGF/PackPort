package com.packbridge.dto;

import java.util.Map;

public class SecurityStatisticsDto {

    private long activeSessions;
    private long failedLogins;
    private long successfulLogins;
    private long lockedAccounts;
    private long securityEvents;

    public long getActiveSessions() {
        return activeSessions;
    }

    public void setActiveSessions(long activeSessions) {
        this.activeSessions = activeSessions;
    }

    public long getFailedLogins() {
        return failedLogins;
    }

    public void setFailedLogins(long failedLogins) {
        this.failedLogins = failedLogins;
    }

    public long getSuccessfulLogins() {
        return successfulLogins;
    }

    public void setSuccessfulLogins(long successfulLogins) {
        this.successfulLogins = successfulLogins;
    }

    public long getLockedAccounts() {
        return lockedAccounts;
    }

    public void setLockedAccounts(long lockedAccounts) {
        this.lockedAccounts = lockedAccounts;
    }

    public long getSecurityEvents() {
        return securityEvents;
    }

    public void setSecurityEvents(long securityEvents) {
        this.securityEvents = securityEvents;
    }
}