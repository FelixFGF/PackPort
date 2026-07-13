package com.packbridge.dto;

public class ErrorReportCreateRequest {
    public String severity;
    public String errorMessage;
    public String stacktrace;

    public String jobId;

    public String browser;
    public String operatingSystem;

    public String minecraftVersion;
    public String loader;
    public String modpackName;
    public String installedMods;

    public String conversionStep;

    public String userNotes;

    public String logs;

    // metadata
    public String applicationVersion;
}