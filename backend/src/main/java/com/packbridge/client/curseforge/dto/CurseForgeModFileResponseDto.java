package com.packbridge.client.curseforge.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CurseForgeModFileResponseDto {

    private String fileName;

    private String displayName;

    private String fileDate;

    private long fileLength;

    private Map<String, String> hashes;

    private String releaseType;

    private List<String> gameVersions;

    /**
     * CurseForge returns dependencies as structured objects; we keep this flexible.
     * For the current modrinth mapping we don't need the full dependency shape.
     */
    private Object dependencies;
}