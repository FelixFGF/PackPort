package com.packbridge.client.curseforge.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CurseForgeDownloadUrlResponseDto {

    /**
     * Typical response field in CurseForge: "downloadUrl"
     */
    private String downloadUrl;

    /**
     * Some variants may return "url" instead of "downloadUrl".
     * We keep it to map both possibilities without guessing further.
     */
    private String url;
}