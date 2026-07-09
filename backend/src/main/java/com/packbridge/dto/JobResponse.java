package com.packbridge.dto;

import com.packbridge.model.CompatibilityResult;
import com.packbridge.model.ConversionJobStatus;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModpackType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class JobResponse {
    private UUID jobId;
    private UUID uploadId;
    private ConversionJobStatus status;
    private int progress;
    private Instant createdAt;
    private String resultPath;

    private ModpackType modpackType = ModpackType.UNKNOWN;

    private List<String> detectedMods = new ArrayList<>();
    private List<String> unsupportedMods = new ArrayList<>();

    // Phase 2C
    private List<CompatibilityResult> compatibilityResults = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    // Phase 2D (conversion simulation)
    private List<String> convertedMods = new ArrayList<>();
    private List<String> removedMods = new ArrayList<>();
    private String outputFileName;

    private ManifestInfo manifestInfo;

    public JobResponse() {}

    public JobResponse(
            UUID jobId,
            UUID uploadId,
            ConversionJobStatus status,
            int progress,
            Instant createdAt,
            String resultPath,
            ModpackType modpackType,
            List<String> detectedMods,
            List<String> unsupportedMods,
            List<CompatibilityResult> compatibilityResults,
            List<String> warnings,
            List<String> convertedMods,
            List<String> removedMods,
            String outputFileName,
            ManifestInfo manifestInfo
    ) {
        this.jobId = jobId;
        this.uploadId = uploadId;
        this.status = status;
        this.progress = progress;
        this.createdAt = createdAt;
        this.resultPath = resultPath;

        this.modpackType = modpackType == null ? ModpackType.UNKNOWN : modpackType;

        this.detectedMods = detectedMods == null ? new ArrayList<>() : detectedMods;
        this.unsupportedMods = unsupportedMods == null ? new ArrayList<>() : unsupportedMods;
        this.compatibilityResults =
                compatibilityResults == null ? new ArrayList<>() : compatibilityResults;
        this.warnings = warnings == null ? new ArrayList<>() : warnings;

        this.convertedMods = convertedMods == null ? new ArrayList<>() : convertedMods;
        this.removedMods = removedMods == null ? new ArrayList<>() : removedMods;
        this.outputFileName = outputFileName;

        this.manifestInfo = manifestInfo;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public UUID getUploadId() {
        return uploadId;
    }

    public void setUploadId(UUID uploadId) {
        this.uploadId = uploadId;
    }

    public ConversionJobStatus getStatus() {
        return status;
    }

    public void setStatus(ConversionJobStatus status) {
        this.status = status;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getResultPath() {
        return resultPath;
    }

    public void setResultPath(String resultPath) {
        this.resultPath = resultPath;
    }

    public ModpackType getModpackType() {
        return modpackType;
    }

    public void setModpackType(ModpackType modpackType) {
        this.modpackType = modpackType == null ? ModpackType.UNKNOWN : modpackType;
    }

    public List<String> getDetectedMods() {
        return detectedMods;
    }

    public void setDetectedMods(List<String> detectedMods) {
        this.detectedMods = detectedMods == null ? new ArrayList<>() : detectedMods;
    }

    public List<String> getUnsupportedMods() {
        return unsupportedMods;
    }

    public void setUnsupportedMods(List<String> unsupportedMods) {
        this.unsupportedMods = unsupportedMods == null ? new ArrayList<>() : unsupportedMods;
    }

    public List<CompatibilityResult> getCompatibilityResults() {
        return compatibilityResults;
    }

    public void setCompatibilityResults(List<CompatibilityResult> compatibilityResults) {
        this.compatibilityResults = compatibilityResults == null ? new ArrayList<>() : compatibilityResults;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings == null ? new ArrayList<>() : warnings;
    }

    public List<String> getConvertedMods() {
        return convertedMods;
    }

    public void setConvertedMods(List<String> convertedMods) {
        this.convertedMods = convertedMods == null ? new ArrayList<>() : convertedMods;
    }

    public List<String> getRemovedMods() {
        return removedMods;
    }

    public void setRemovedMods(List<String> removedMods) {
        this.removedMods = removedMods == null ? new ArrayList<>() : removedMods;
    }

    public String getOutputFileName() {
        return outputFileName;
    }

    public void setOutputFileName(String outputFileName) {
        this.outputFileName = outputFileName;
    }

    public ManifestInfo getManifestInfo() {
        return manifestInfo;
    }

    public void setManifestInfo(ManifestInfo manifestInfo) {
        this.manifestInfo = manifestInfo;
    }
}