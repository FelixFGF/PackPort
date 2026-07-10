package com.packbridge.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        CurseForgeApiProperties.class,
        ModrinthApiProperties.class
})
public class ExternalApiConfig {
}