package com.packbridge.dto.curseforge;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class FileEntry {
    private int projectID;
    private int fileID;
    private boolean required;

    @JsonProperty("isLocked")
    private boolean isLocked;
}
