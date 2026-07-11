package com.packbridge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "packport.api.curseforge")
public class CurseForgeApiProperties {

    private String baseUrl = "https://api.curseforge.com";
    private String key;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            this.baseUrl = "https://api.curseforge.com";
            return;
        }
        this.baseUrl = baseUrl;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}