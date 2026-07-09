package com.packbridge.model;

import lombok.Data;

@Data
public class ManifestMod {
    private int projectId;
    private int fileId;
    private boolean required;
    private boolean isLocked;
}
