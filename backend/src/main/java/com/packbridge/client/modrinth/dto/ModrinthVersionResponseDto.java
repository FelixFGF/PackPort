package com.packbridge.client.modrinth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ModrinthVersionResponseDto {

    private String id;
    private String name;
    private String version_number;

    /**
     * In modrinth API this is typically called "game_versions"
     */
    private List<String> game_versions;

    /**
     * Loader/compatible platform constraints.
     * In modrinth API this is typically under "loaders" as string list.
     */
    private List<String> loaders;

    private List<ModrinthFileDto> files;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ModrinthFileDto {
        private String url;
        private String filename;
        private long size;
        private boolean primary;
        private Map<String, String> hashes;
    }
}