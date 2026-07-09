package com.packbridge.dto.curseforge;

import lombok.Data;

import java.util.List;

@Data
public class MinecraftInfo {
    private String version;
    private List<ModLoader> modLoaders;
}
