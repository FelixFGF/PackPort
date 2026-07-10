package com.packbridge.client.modrinth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.packbridge.client.modrinth.dto.ModrinthVersionResponseDto;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ModrinthClient {

    private final RestClient modrinthRestClient;
    private final ObjectMapper objectMapper;

    public ModrinthClient(RestClient modrinthRestClient, ObjectMapper objectMapper) {
        this.modrinthRestClient = modrinthRestClient;
        this.objectMapper = objectMapper;
    }

    /**
     * GET /v2/search
     */
    public JsonNode search(Map<String, String> queryParams) {
        // Keep as JsonNode to avoid wrong DTO field guessing for search results.
        // Filtering happens in CurseForgeModResolutionService.
        return modrinthRestClient
                .get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v2/search");
                    if (queryParams != null) {
                        for (var entry : queryParams.entrySet()) {
                            if (entry.getKey() != null && entry.getValue() != null) {
                                uriBuilder.queryParam(entry.getKey(), entry.getValue());
                            }
                        }
                    }
                    return uriBuilder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }

    /**
     * GET /v2/project/{project_id}/version
     */
    public List<ModrinthVersionResponseDto> getProjectVersions(String projectId) {
        JsonNode node = modrinthRestClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/project/{project_id}/version")
                        .build(Map.of("project_id", projectId)))
                .retrieve()
                .body(JsonNode.class);

        if (node == null || !node.isArray()) {
            return List.of();
        }

        List<ModrinthVersionResponseDto> out = new ArrayList<>();
        for (JsonNode element : node) {
            out.add(objectMapper.convertValue(element, ModrinthVersionResponseDto.class));
        }
        return out;
    }

    /**
     * GET /v2/version/{version_id}
     */
    public ModrinthVersionResponseDto getVersion(String versionId) {
        JsonNode node = modrinthRestClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/version/{version_id}")
                        .build(Map.of("version_id", versionId)))
                .retrieve()
                .body(JsonNode.class);

        return objectMapper.convertValue(node, ModrinthVersionResponseDto.class);
    }
}