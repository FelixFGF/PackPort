package com.packbridge.security.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "active_admin_sessions")
public class ActiveAdminSessionEntity {

    @Id
    @Column(name = "session_id", length = 128)
    private String sessionId;

    @Column(nullable = false, length = 64)
    private String username;

    @Column(nullable = false)
    private OffsetDateTime loginTime;

    @Column(nullable = false)
    private OffsetDateTime lastActivity;

    @Column(nullable = false, length = 64)
    private String ipAddress;

    @Column(nullable = false, length = 1024)
    private String userAgent;

    @Column(nullable = true, length = 255)
    private String browser;

    @Column(nullable = true, length = 255)
    private String operatingSystem;

    @Column(nullable = true, length = 128)
    private String correlationId;

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public OffsetDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(OffsetDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public OffsetDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(OffsetDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
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

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
}