package com.packbridge.controller;

import com.packbridge.config.FileStorageProperties;
import com.packbridge.model.ConversionJob;
import com.packbridge.service.JobService;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DownloadController {

    private static final Logger logger = LoggerFactory.getLogger(DownloadController.class);

    private final JobService jobService;
    private final Path fileStorageLocation;

    public DownloadController(JobService jobService, FileStorageProperties fileStorageProperties) {
        this.jobService = jobService;
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath()
                .normalize();
    }

    @GetMapping("/download/{jobId}")
    public ResponseEntity<?> download(@PathVariable("jobId") String jobId) {
        // Job lookup
        ConversionJob job;
        try {
            job = jobService.getJob(java.util.UUID.fromString(jobId)).orElse(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job not found");
        }

        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job not found");
        }

        String outputFileName = job.getOutputFileName();
        String resultPath = job.getResultPath();

        // Temporary debug logging (as requested)
        System.out.println("DOWNLOAD DEBUG:");
        System.out.println("job.outputFileName = " + job.getOutputFileName());
        System.out.println("job.resultPath = " + job.getResultPath());

        // 1) Resolve output file name from job first
        Path outputFile = null;
        boolean usedFallback = false;

        if (outputFileName != null && !outputFileName.isBlank()) {
            Path candidate = fileStorageLocation.resolve(outputFileName).normalize();
            System.out.println("resolved file = " + candidate.toAbsolutePath());
            System.out.println("exists = " + Files.exists(candidate));

            if (Files.exists(candidate) && Files.isRegularFile(candidate)) {
                outputFile = candidate;
                System.out.println("branch = outputFileName (generated export selection)");
            } else {
                System.out.println("branch = outputFileName (missing; will consider fallback)");
            }
        }

        // 2) Fallback to upload artifacts
        if (outputFile == null) {
            usedFallback = true;
            String uploadIdStr = job.getUploadId() == null ? null : job.getUploadId().toString();
            System.out.println("branch = fallback (upload artifact) enabled uploadIdStr=" + uploadIdStr);

            if (uploadIdStr != null) {
                Path mrpackCandidate = fileStorageLocation.resolve(uploadIdStr + ".mrpack").normalize();
                System.out.println("resolved file (fallback mrpack) = " + mrpackCandidate.toAbsolutePath());
                System.out.println("exists (fallback mrpack) = " + Files.exists(mrpackCandidate));

                if (Files.exists(mrpackCandidate) && Files.isRegularFile(mrpackCandidate)) {
                    outputFile = mrpackCandidate;
                    System.out.println("fallbackSelection = <uploadId>.mrpack");
                } else {
                    Path zipCandidate = fileStorageLocation.resolve(uploadIdStr + ".zip").normalize();
                    System.out.println("resolved file (fallback zip) = " + zipCandidate.toAbsolutePath());
                    System.out.println("exists (fallback zip) = " + Files.exists(zipCandidate));

                    if (Files.exists(zipCandidate) && Files.isRegularFile(zipCandidate)) {
                        outputFile = zipCandidate;
                        System.out.println("fallbackSelection = <uploadId>.zip");
                    }
                }
            }
        }

        if (outputFile == null) {
            logger.warn(
                    "DOWNLOAD debug: outputFile resolved to null. outputFileName='{}' usedFallback={}",
                    outputFileName,
                    usedFallback
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Output file not found");
        }

        String downloadName = buildDownloadFileName(job);
        System.out.println("content-disposition = " + downloadName);
        System.out.println("servingGeneratedExport = " + !usedFallback);
        System.out.println("final resolved outputFile = " + outputFile.toAbsolutePath());
        System.out.println("final exists = " + Files.exists(outputFile));

        String downloadFileName = downloadName;

        try {
            InputStream inputStream = Files.newInputStream(outputFile);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", downloadFileName);

            return new ResponseEntity<>(
                    new org.springframework.core.io.InputStreamResource(inputStream),
                    headers,
                    HttpStatus.OK
            );
        } catch (IOException e) {
            logger.error("DOWNLOAD debug: failed streaming outputFile={}", outputFile, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to stream output file");
        }
    }

    private String buildDownloadFileName(ConversionJob job) {
        System.out.println(
                "[DownloadController] buildDownloadFileName: packName(before read)="
                        + (job.getManifestInfo() == null ? null : job.getManifestInfo().getPackName())
        );

        String packName = null;

        if (job.getManifestInfo() != null && job.getManifestInfo().getPackName() != null) {
            packName = job.getManifestInfo().getPackName();
        }

        String base;
        if (packName != null && !packName.isBlank()) {
            base = packName;
        } else {
            base = job.getUploadId() == null ? "PackPort" : job.getUploadId().toString();
        }

        base = base.replaceAll("[\\\\/:*?\"<>|]", "");

        if (base.isBlank()) {
            base = "PackPort";
        }

        return base + " (PackPort.ddns.net).mrpack";
    }
}