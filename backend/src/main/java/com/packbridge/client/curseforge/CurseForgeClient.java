package com.packbridge.client.curseforge;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.packbridge.client.curseforge.dto.CurseForgeDownloadUrlResponseDto;
import com.packbridge.client.curseforge.dto.CurseForgeModFileResponseDto;
import org.springframework.web.client.RestClient;

import java.util.Map;

public class CurseForgeClient {

    private final RestClient curseForgeRestClient;
    private final ObjectMapper objectMapper;

    public CurseForgeClient(RestClient curseForgeRestClient, ObjectMapper objectMapper) {
        this.curseForgeRestClient = curseForgeRestClient;
        this.objectMapper = objectMapper;
    }

    public CurseForgeModFileResponseDto getModFile(int modId, int fileId) {
        JsonNode node = curseForgeRestClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/mods/{modId}/files/{fileId}")
                        .build(modId, fileId))
                .retrieve()
                .body(JsonNode.class);

        return objectMapper.convertValue(node, CurseForgeModFileResponseDto.class);
    }

    public CurseForgeDownloadUrlResponseDto getModFileDownloadUrl(int modId, int fileId) {
        JsonNode node = curseForgeRestClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/mods/{modId}/files/{fileId}/download-url")
                        .build(modId, fileId))
                .retrieve()
                .body(JsonNode.class);

        return objectMapper.convertValue(node, CurseForgeDownloadUrlResponseDto.class);
    }
}