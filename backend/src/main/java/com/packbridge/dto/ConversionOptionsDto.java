package com.packbridge.dto;

public class ConversionOptionsDto {

    public enum UnsupportedModAction {
        IMPORT_JAR,
        SKIP_MOD
    }

    private UnsupportedModAction action;

    public ConversionOptionsDto() {
    }

    public ConversionOptionsDto(UnsupportedModAction action) {
        this.action = action;
    }

    public UnsupportedModAction getAction() {
        return action;
    }

    public void setAction(UnsupportedModAction action) {
        this.action = action;
    }
}