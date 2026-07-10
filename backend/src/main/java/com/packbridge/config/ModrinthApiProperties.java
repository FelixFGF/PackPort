package com.packbridge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "modrinth.api")
public class ModrinthApiProperties {
    /**
     * Base URL for Modrinth API, e.g. https://api.modrinth.com/v2
     */
    private String baseUrl;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}