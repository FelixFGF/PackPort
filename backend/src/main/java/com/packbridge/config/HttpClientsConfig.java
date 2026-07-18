package com.packbridge.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.DefaultUriBuilderFactory;

@Configuration
@EnableConfigurationProperties({
        CurseForgeApiProperties.class,
        ExternalApisProperties.class,
        ModrinthApiProperties.class
})
public class HttpClientsConfig {

    @Bean
    public RestClient curseForgeRestClient(CurseForgeApiProperties props, ExternalApisProperties externalApisProperties) {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(props.getBaseUrl());

        // Canonical source for the CurseForge API key:
        // - CURSEFORGE_API_KEY is bound to ExternalApisProperties (prefix "curseforge.api")
        // - packport.api.curseforge.key is bound to CurseForgeApiProperties (prefix "packport.api.curseforge")
        // To avoid configuration mismatch, if CurseForgeApiProperties.key is blank, copy over.
        if ((props.getKey() == null || props.getKey().isBlank())
                && externalApisProperties != null
                && externalApisProperties.getKey() != null
                && !externalApisProperties.getKey().isBlank()) {
            props.setKey(externalApisProperties.getKey().trim());
        }

        RestClient.Builder builder = RestClient.builder()
                .uriBuilderFactory(factory);

        // CurseForge API key is optional; only attach header if set.
        if (props.getKey() != null && !props.getKey().isBlank()) {
            builder = builder.defaultHeader("x-api-key", props.getKey().trim());
        }

        return builder.build();
    }

    @Bean
    public RestClient modrinthRestClient(ModrinthApiProperties props) {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(props.getBaseUrl());
        return RestClient.builder()
                .uriBuilderFactory(factory)
                .build();
    }
}

