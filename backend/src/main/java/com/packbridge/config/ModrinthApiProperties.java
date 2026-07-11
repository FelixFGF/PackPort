package com.packbridge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "packport.api.modrinth")
public class ModrinthApiProperties {

    /**
     * Base URL for Modrinth API, e.g. https://api.modrinth.com/v2
     */
    private String baseUrl = "https://api.modrinth.com/v2";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            this.baseUrl = "https://api.modrinth.com/v2";
            return;
        }
        this.baseUrl = baseUrl;
    }
}