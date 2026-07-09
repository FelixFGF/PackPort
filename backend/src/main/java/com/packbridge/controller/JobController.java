package com.packbridge.controller;

import com.packbridge.dto.ApiResponse;
import com.packbridge.dto.JobResponse;
import com.packbridge.model.ConversionJobStatus;
import com.packbridge.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable("jobId") String jobId) {
        UUID parsedJobId;
        try {
            parsedJobId = UUID.fromString(jobId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Invalid jobId", null));
        }

        return jobService.getJob(parsedJobId)
                .map(job -> {
                    JobResponse response = new JobResponse(
                            job.getJobId(),
                            job.getUploadId(),
                            job.getStatus(),
                            job.getProgress(),
                            job.getCreatedAt(),
                            job.getResultPath(),
                            job.getModpackType(),
                            job.getDetectedMods(),
                            job.getUnsupportedMods(),
                            job.getCompatibilityResults(),
                            job.getWarnings(),
                            job.getConvertedMods(),
                            job.getRemovedMods(),
                            job.getOutputFileName(),
                            job.getManifestInfo()
                    );
                    return ResponseEntity.ok(new ApiResponse<>(true, "Job found", response));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Job not found", null)));
    }

    @GetMapping("/jobByUpload/{uploadId}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobByUpload(@PathVariable("uploadId") String uploadId) {
        UUID parsedUploadId;
        try {
            parsedUploadId = UUID.fromString(uploadId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Invalid uploadId", null));
        }

        return jobService.getJobByUploadId(parsedUploadId)
                .map(job -> {
                    JobResponse response = new JobResponse(
                            job.getJobId(),
                            job.getUploadId(),
                            job.getStatus(),
                            job.getProgress(),
                            job.getCreatedAt(),
                            job.getResultPath(),
                            job.getModpackType(),
                            job.getDetectedMods(),
                            job.getUnsupportedMods(),
                            job.getCompatibilityResults(),
                            job.getWarnings(),
                            job.getConvertedMods(),
                            job.getRemovedMods(),
                            job.getOutputFileName(),
                            job.getManifestInfo()
                    );
                    return ResponseEntity.ok(new ApiResponse<>(true, "Job found", response));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Job not found", null)));
    }
}