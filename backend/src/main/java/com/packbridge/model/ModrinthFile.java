package com.packbridge.model;

import lombok.Data;

import java.util.Map;

@Data
public class ModrinthFile {

    private String path;

    private int downloads;

    private ModrinthHashes hashes;

    private long fileSize;

    private Map<String, String> env;
}