package com.packbridge.dto;

import java.util.UUID;

public class UploadResponse {
    private UUID uploadId;
    private UUID jobId;
    private String fileName;
    private long size;
    private String status;

    // Backward-compatible constructor (jobId not set)
    public UploadResponse(UUID uploadId, String fileName, long size, String status) {
        this.uploadId = uploadId;
        this.fileName = fileName;
        this.size = size;
        this.status = status;
    }

    // New constructor including jobId
    public UploadResponse(UUID uploadId, UUID jobId, String fileName, long size, String status) {
        this.uploadId = uploadId;
        this.jobId = jobId;
        this.fileName = fileName;
        this.size = size;
        this.status = status;
    }

    // Getters and Setters
    public UUID getUploadId() {
        return uploadId;
    }

    public void setUploadId(UUID uploadId) {
        this.uploadId = uploadId;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
