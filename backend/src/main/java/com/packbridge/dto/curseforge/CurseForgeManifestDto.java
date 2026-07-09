package com.packbridge.dto.curseforge;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CurseForgeManifestDto {
    private String name;
    private String version;
    private String author;
    private String overrides;
    private MinecraftInfo minecraft;
    private List<FileEntry> files;
}
