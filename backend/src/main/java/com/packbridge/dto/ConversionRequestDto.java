package com.packbridge.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;

public class ConversionRequestDto {

    public enum Platform {
        CURSEFORGE,
        MODRINTH
    }

    @NotNull
    private String uploadId;

    @NotNull
    private Platform targetPlatform;

    public ConversionRequestDto() {
    }

    @JsonCreator
    public ConversionRequestDto(String uploadId, Platform targetPlatform) {
        this.uploadId = uploadId;
        this.targetPlatform = targetPlatform;
    }

    public String getUploadId() {
        return uploadId;
    }

    public void setUploadId(String uploadId) {
        this.uploadId = uploadId;
    }

    public Platform getTargetPlatform() {
        return targetPlatform;
    }

    public void setTargetPlatform(Platform targetPlatform) {
        this.targetPlatform = targetPlatform;
    }
}