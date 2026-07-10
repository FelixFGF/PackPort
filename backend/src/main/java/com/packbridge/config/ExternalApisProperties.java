package com.packbridge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "curseforge.api")
public class ExternalApisProperties {
    /**
     * Base URL for CurseForge API, e.g. https://api.curseforge.com
     */
    private String baseUrl;

    /**
     * CurseForge API key. If blank, calls must be done without Authorization header.
     * Can be overridden via environment variable CURSEFORGE_API_KEY.
     */
    private String key;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}