package com.packbridge.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ConversionJob {

    private UUID uploadId;

    private int progress; // 0..100
    private Instant createdAt;
    private String resultPath; // optional

    private ModpackType modpackType = ModpackType.UNKNOWN;

    private ManifestInfo manifestInfo;

    private List<String> detectedMods = new ArrayList<>();
    private List<String> unsupportedMods = new ArrayList<>();
    private List<CompatibilityResult> compatibilityResults = new ArrayList<>();

    private List<String> warnings = new ArrayList<>();
    private List<CurseForgeMod> curseForgeMods = new ArrayList<>();

    // Optional override for export base name (without suffix/extension).
    private String exportNameBase;

    public List<CurseForgeMod> getCurseForgeMods() {
        return curseForgeMods;
    }

    public void setCurseForgeMods(List<CurseForgeMod> curseForgeMods) {
        this.curseForgeMods = curseForgeMods;
    }

    // Phase 2D: conversion simulation
    private List<String> convertedMods = new ArrayList<>();
    private List<String> removedMods = new ArrayList<>();

    private UUID jobId;
    private ConversionJobStatus status;
    private String outputFileName;

    public ConversionJob() {
        this.jobId = UUID.randomUUID();
        this.status = ConversionJobStatus.CREATED;
        this.createdAt = Instant.now();
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

    public ManifestInfo getManifestInfo() {
        return manifestInfo;
    }

    public void setManifestInfo(ManifestInfo manifestInfo) {
        this.manifestInfo = manifestInfo;
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

    // Conversion simulation getters/setters
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

    public String getExportNameBase() {
        return exportNameBase;
    }

    public void setExportNameBase(String exportNameBase) {
        this.exportNameBase = exportNameBase;
    }
}