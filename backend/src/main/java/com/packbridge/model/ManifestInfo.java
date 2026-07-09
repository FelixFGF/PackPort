package com.packbridge.model;

import lombok.Data;

import java.util.List;

@Data
public class ManifestInfo {
    private String packName;
    private String packVersion;
    private String author;
    private String minecraftVersion;
    private String loader;
    private String imagePath;
    private int totalMods;
    private List<ManifestMod> mods;
}
