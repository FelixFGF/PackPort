package com.packbridge.model;

import lombok.Data;

import java.util.List;

@Data
public class ModrinthIndex {

    private String game;

    private int formatVersion;

    private String versionId;

    private String name;

    private String summary;

    private ModrinthDependency dependencies;

    private List<ModrinthFile> files;
}