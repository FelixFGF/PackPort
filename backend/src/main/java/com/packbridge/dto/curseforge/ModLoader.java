package com.packbridge.dto.curseforge;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ModLoader {
    private String id;
    private boolean primary;

    @JsonCreator
    public ModLoader(@JsonProperty("id") String id, @JsonProperty("primary") boolean primary) {
        this.id = id;
        this.primary = primary;
    }
}
