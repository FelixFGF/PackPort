package com.packbridge.dto;

import java.time.Instant;

public class ConversionDto {
    public String jobId;
    public Instant timestampUtc;

    public String modpackName;
    public String minecraftVersion;
    public String loader;
    public String operatingSystem;

    public boolean conversionStarted;
    public boolean conversionFinished;
    public boolean conversionFailed;

    public Long conversionDurationMs;

    public String status;
}