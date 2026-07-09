package com.packbridge.model;



public class CompatibilityResult {
    private String modId;


    private CompatibilityLoaderType loader;
    private String reason; // null when compatible

    public CompatibilityResult() {}

    public CompatibilityResult(String modId, CompatibilityLoaderType loader, String reason) {
        this.modId = modId;
        this.loader = loader;
        this.reason = reason;
    }

    public String getModId() {
        return modId;
    }

    public void setModId(String modId) {
        this.modId = modId;
    }

    public CompatibilityLoaderType getLoader() {
        return loader;
    }

    public void setLoader(CompatibilityLoaderType loader) {
        this.loader = loader;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}