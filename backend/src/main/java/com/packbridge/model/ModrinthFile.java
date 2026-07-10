package com.packbridge.model;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ModrinthFile {

    private String path;

    /**
     * Modrinth index spec: downloads is an array of download URLs.
     */
    private List<String> downloads;

    private ModrinthHashes hashes;

    private long fileSize;

    /**
     * Keep it flexible (JSON object). We'll populate it with a spec-appropriate shape in the resolver.
     */
    private Map<String, Object> env;
}