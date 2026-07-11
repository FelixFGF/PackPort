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
        this.fileStorageLocation =
                Paths.get(fileStorageProperties.getTempDir()).toAbsolutePath().normalize();
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

        // 0) Primary resolve using job.resultPath (full exporter path)
        Path outputFile = null;
        boolean usedFallback = false;

        if (resultPath != null && !resultPath.isBlank()) {
            Path resolved = Paths.get(resultPath).toAbsolutePath().normalize();

            System.out.println("primaryResolve=job.resultPath");
            System.out.println("jobId=" + job.getJobId());
            System.out.println("uploadId=" + job.getUploadId());
            System.out.println("job.resultPath=" + resultPath);

            System.out.println("resolved file (resultPath) = " + resolved);
            System.out.println("exists (resultPath) = " + Files.exists(resolved));
            System.out.println("isRegularFile (resultPath) = " + Files.isRegularFile(resolved));

            if (Files.exists(resolved) && Files.isRegularFile(resolved)) {
                try {
                    long size = Files.size(resolved);
                    System.out.println("size (resultPath) = " + size + " bytes");
                } catch (IOException ignore) {
                    System.out.println("size (resultPath) = unknown");
                }
                outputFile = resolved;
                System.out.println("branch = resultPath (generated export selection)");
            } else {
                System.out.println("branch = resultPath (missing; will consider outputFileName fallback chain)");
            }
        } else {
            System.out.println("primaryResolve=job.resultPath skipped because resultPath is blank/null");
        }

        // 1) Resolve output file name from job (existing behavior)
        if (outputFile == null && outputFileName != null && !outputFileName.isBlank()) {
            // EXPORT outputs are written into: <tempDir>/<jobId>/<outputFileName>
            Path candidate = fileStorageLocation
                    .resolve(job.getJobId().toString())
                    .resolve(outputFileName)
                    .normalize();

            System.out.println("resolveByOutputFileName=outputFileName");
            System.out.println("job.outputFileName=" + outputFileName);
            System.out.println("resolved file = " + candidate.toAbsolutePath());

            boolean exists = Files.exists(candidate);
            boolean isRegular = Files.isRegularFile(candidate);

            System.out.println("exists = " + exists);
            System.out.println("isRegularFile = " + isRegular);

            if (exists && isRegular) {
                try {
                    long size = Files.size(candidate);
                    System.out.println("size (outputFileName) = " + size + " bytes");
                } catch (IOException ignore) {
                    System.out.println("size (outputFileName) = unknown");
                }

                outputFile = candidate;
                System.out.println("branch = outputFileName (generated export selection)");
            } else {
                System.out.println("branch = outputFileName (missing; will consider fallback)");
            }
        }

        // 2) Fallback to upload artifacts (existing behavior)
        if (outputFile == null) {
            usedFallback = true;
            String uploadIdStr = job.getUploadId() == null ? null : job.getUploadId().toString();

            System.out.println("branch = fallback (upload artifact) enabled uploadIdStr=" + uploadIdStr);

            if (uploadIdStr != null) {
                Path mrpackCandidate = fileStorageLocation.resolve(uploadIdStr + ".mrpack").normalize();
                System.out.println("resolved file (fallback mrpack) = " + mrpackCandidate.toAbsolutePath());
                System.out.println("exists (fallback mrpack) = " + Files.exists(mrpackCandidate));
                System.out.println("isRegularFile (fallback mrpack) = " + Files.isRegularFile(mrpackCandidate));

                if (Files.exists(mrpackCandidate) && Files.isRegularFile(mrpackCandidate)) {
                    try {
                        long size = Files.size(mrpackCandidate);
                        System.out.println("size (fallback mrpack) = " + size + " bytes");
                    } catch (IOException ignore) {
                        System.out.println("size (fallback mrpack) = unknown");
                    }

                    outputFile = mrpackCandidate;
                    System.out.println("fallbackSelection = <uploadId>.mrpack");
                } else {
                    Path zipCandidate = fileStorageLocation.resolve(uploadIdStr + ".zip").normalize();
                    System.out.println("resolved file (fallback zip) = " + zipCandidate.toAbsolutePath());
                    System.out.println("exists (fallback zip) = " + Files.exists(zipCandidate));
                    System.out.println("isRegularFile (fallback zip) = " + Files.isRegularFile(zipCandidate));

                    if (Files.exists(zipCandidate) && Files.isRegularFile(zipCandidate)) {
                        try {
                            long size = Files.size(zipCandidate);
                            System.out.println("size (fallback zip) = " + size + " bytes");
                        } catch (IOException ignore) {
                            System.out.println("size (fallback zip) = unknown");
                        }

                        outputFile = zipCandidate;
                        System.out.println("fallbackSelection = <uploadId>.zip");
                    }
                }
            }
        }

        if (outputFile == null) {
            String reason;
            boolean hasResultPath = resultPath != null && !resultPath.isBlank();
            boolean hasOutputFileName = outputFileName != null && !outputFileName.isBlank();

            if (hasResultPath) {
                reason = "job.resultPath provided but resolved file does not exist/isRegularFile. resultPath=" + resultPath;
            } else if (hasOutputFileName) {
                reason = "job.resultPath blank; outputFileName fallback also missing. outputFileName=" + outputFileName;
            } else {
                reason = "No valid job.resultPath and no usable outputFileName; fallback upload artifacts missing too.";
            }

            logger.warn(
                    "DOWNLOAD 404 debug: jobId={} uploadId={} outputFileName='{}' resultPath='{}' usedFallback={} reason={}",
                    job.getJobId(),
                    job.getUploadId(),
                    outputFileName,
                    resultPath,
                    usedFallback,
                    reason
            );

            System.out.println("DOWNLOAD 404 debug reason: " + reason);
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

            // Cleanup erst nach erfolgreichem Download: wir löschen beim Schließen des Streams.
            // Job-Ordner wird von ModrinthExportService als <tempDir>/<jobId>/ genutzt.
            Path jobTempDir = fileStorageLocation.resolve(job.getJobId().toString()).normalize();

            InputStream cleanupOnCloseStream =
                    new java.io.FilterInputStream(inputStream) {
                        @Override
                        public void close() throws IOException {
                            try {
                                super.close();
                            } finally {
                                // Rekursiv löschen: temp_uploads/<jobId>/
                                if (Files.exists(jobTempDir)) {
                                    try {
                                        Files.walk(jobTempDir)
                                                .sorted(java.util.Comparator.reverseOrder())
                                                .forEach(
                                                        p -> {
                                                            try {
                                                                Files.deleteIfExists(p);
                                                            } catch (IOException ex) {
                                                                logger.warn(
                                                                        "Could not delete temp path {}",
                                                                        p,
                                                                        ex);
                                                            }
                                                        });
                                    } catch (Exception ex) {
                                        logger.warn(
                                                "Cleanup after download failed for jobTempDir={}",
                                                jobTempDir,
                                                ex);
                                    }
                                }
                            }
                        }
                    };

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", downloadFileName);

            return new ResponseEntity<>(
                    new org.springframework.core.io.InputStreamResource(cleanupOnCloseStream),
                    headers,
                    HttpStatus.OK);
        } catch (IOException e) {
            logger.error("DOWNLOAD debug: failed streaming outputFile={}", outputFile, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to stream output file");
        }
    }

    private String buildDownloadFileName(ConversionJob job) {
        System.out.println(
                "[DownloadController] buildDownloadFileName: packName(before read)="
                        + (job.getManifestInfo() == null ? null : job.getManifestInfo().getPackName()));

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

        return base + " (PackPort.Netlify.App).mrpack";
    }
}