package com.packbridge.dto;

public class UnsupportedModDto {

    private String modName;
    private String sourcePlatform;
    private String targetPlatform;

    /**
     * For now we only return a contract that indicates the UI should ask the user.
     * Service will populate recommendedAction = "ASK_USER" for each unsupported mod.
     */
    private String recommendedAction;

    public UnsupportedModDto() {
    }

    public UnsupportedModDto(String modName, String sourcePlatform, String targetPlatform, String recommendedAction) {
        this.modName = modName;
        this.sourcePlatform = sourcePlatform;
        this.targetPlatform = targetPlatform;
        this.recommendedAction = recommendedAction;
    }

    public String getModName() {
        return modName;
    }

    public void setModName(String modName) {
        this.modName = modName;
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

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }
}