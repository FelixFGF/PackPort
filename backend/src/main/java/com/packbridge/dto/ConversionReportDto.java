package com.packbridge.dto;

import java.util.List;

public class ConversionReportDto {

    /**
     * For now this is a scaffold. Real conversion progress/status will be added later.
     */
    private String status;

    private String sourcePlatform;
    private String targetPlatform;

    private List<UnsupportedModDto> unsupportedMods;

    private ConversionOptionsDto options;

    public ConversionReportDto() {
    }

    public ConversionReportDto(String status,
                                 String sourcePlatform,
                                 String targetPlatform,
                                 List<UnsupportedModDto> unsupportedMods,
                                 ConversionOptionsDto options) {
        this.status = status;
        this.sourcePlatform = sourcePlatform;
        this.targetPlatform = targetPlatform;
        this.unsupportedMods = unsupportedMods;
        this.options = options;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSourcePlatform() {
        return sourcePlatform;
    }

    public void setSourcePlatform(String sourcePlatform) {
        this.sourcePlatform = sourcePlatform;
    }

    public String getTargetPlatform() {
        return targetPlatform;
    }

    public void setTargetPlatform(String targetPlatform) {
        this.targetPlatform = targetPlatform;
    }

    public List<UnsupportedModDto> getUnsupportedMods() {
        return unsupportedMods;
    }

    public void setUnsupportedMods(List<UnsupportedModDto> unsupportedMods) {
        this.unsupportedMods = unsupportedMods;
    }

    public ConversionOptionsDto getOptions() {
        return options;
    }

    public void setOptions(ConversionOptionsDto options) {
        this.options = options;
    }
}