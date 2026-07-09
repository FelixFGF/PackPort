package com.packbridge.model;

import lombok.Data;

import java.util.Map;

@Data
public class ModrinthDependency {

    /**
     * Modrinth dependency map as used by modrinth.index.json.
     * Example:
     * {
     *   "minecraft": ">=1.20.1",
     *   "forge": "*"
     * }
     */
    private Map<String, String> dependencies;
}