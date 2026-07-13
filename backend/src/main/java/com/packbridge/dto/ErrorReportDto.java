package com.packbridge.dto;

import java.time.Instant;
import java.util.UUID;

public class ErrorReportDto {
    public UUID id;
    public Instant timestampUtc;

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

    public String applicationVersion;
    public String logs;
    public String userNotes;

    public String conversionStep;

    public boolean resolved;
    public String resolvedBy;
    public Instant resolvedAt;
}