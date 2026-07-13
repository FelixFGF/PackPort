package com.packbridge.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AdminActivityDto {

    private UUID id;
    private OffsetDateTime timestampUtc;
    private String username;
    private String action;
    private String description;
    private String ipAddress;
    private String browser;
    private String operatingSystem;
    private String sessionId;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public OffsetDateTime getTimestampUtc() {
        return timestampUtc;
    }

    public void setTimestampUtc(OffsetDateTime timestampUtc) {
        this.timestampUtc = timestampUtc;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getBrowser() {
        return browser;
    }

    public void setBrowser(String browser) {
        this.browser = browser;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}