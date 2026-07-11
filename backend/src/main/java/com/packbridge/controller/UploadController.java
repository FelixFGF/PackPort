package com.packbridge.controller;

import com.packbridge.config.FileStorageProperties;
import com.packbridge.dto.ApiResponse;
import com.packbridge.dto.UploadResponse;
import com.packbridge.model.ConversionJobStatus;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModpackType;
import com.packbridge.service.CurseForgeManifestParserService;
import com.packbridge.service.ConversionJobRunnerService;
import com.packbridge.service.FileUploadService;
import com.packbridge.service.JobService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final FileUploadService fileUploadService;
    private final JobService jobService;
    private final CurseForgeManifestParserService curseForgeManifestParserService;
    private final ConversionJobRunnerService conversionJobRunnerService;

    private final Path fileStorageLocation;

    public UploadController(
            FileUploadService fileUploadService,
            JobService jobService,
            CurseForgeManifestParserService curseForgeManifestParserService,
            ConversionJobRunnerService conversionJobRunnerService,
            FileStorageProperties fileStorageProperties
    ) {
        this.fileUploadService = fileUploadService;
        this.jobService = jobService;
        this.curseForgeManifestParserService = curseForgeManifestParserService;
        this.conversionJobRunnerService = conversionJobRunnerService;

        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "exportNameBase", required = false) String exportNameBase
    ) {
        UploadResponse uploadResponse = fileUploadService.uploadFile(file);

        UUID uploadId = uploadResponse.getUploadId();
        var job = jobService.createJob(uploadId);

        // Create unified job folder and move upload artifacts into it.
        moveUploadArtifactsIntoJobFolder(uploadId, job.getJobId());

        // Optional export base name override (without suffix/extension).
        job.setExportNameBase(exportNameBase);

        // Initialize persisted state for polling immediately.
        job.setStatus(ConversionJobStatus.CREATED);
        job.setProgress(0);
        jobService.saveJob(job);

        // Keep wizard fields consistent with existing behavior:
        // - ConversionService and runner will determine types when needed.
        // - If CURSEFORGE type is forced/unknown, runner will parse manifest again as needed.
        // We avoid doing heavy conversion/export synchronously here.
        if (job.getModpackType() == ModpackType.UNKNOWN) {
            // Keep existing behavior: ensure manifestInfo can be shared with runner if needed.
            // This parse is cheaper than full conversion/export and avoids missing manifestInfo.
            // If you want to fully defer even this, remove this block.
            job.setModpackType(ModpackType.CURSEFORGE);
            ManifestInfo parsed = curseForgeManifestParserService.parseManifest(uploadId, job.getJobId());
            job.setManifestInfo(parsed);
            jobService.saveJob(job);
        }

        // Start heavy conversion/export asynchronously so the upload endpoint returns immediately.
        conversionJobRunnerService.runAsync(job);

        UploadResponse enriched = new UploadResponse(
                uploadResponse.getUploadId(),
                job.getJobId(),
                uploadResponse.getFileName(),
                uploadResponse.getSize(),
                ConversionJobStatus.CREATED.name()
        );

        return ResponseEntity.ok(new ApiResponse<>(true, "File uploaded successfully", enriched));
    }

    private void moveUploadArtifactsIntoJobFolder(UUID uploadId, UUID jobId) {
        if (uploadId == null || jobId == null) return;

        Path jobDir = fileStorageLocation.resolve(jobId.toString()).normalize();
        try {
            Files.createDirectories(jobDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create job temp directory: " + jobDir, e);
        }

        moveSingle(fileStorageLocation.resolve(uploadId + ".zip").normalize(), jobDir.resolve(uploadId + ".zip").normalize());
        moveSingle(fileStorageLocation.resolve(uploadId + ".mrpack").normalize(), jobDir.resolve(uploadId + ".mrpack").normalize());
        moveSingle(fileStorageLocation.resolve(uploadId + ".meta").normalize(), jobDir.resolve(uploadId + ".meta").normalize());
    }

    private void moveSingle(Path source, Path target) {
        try {
            if (!Files.exists(source)) return;
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not move temp artifact from " + source + " to " + target, e);
        }
    }

    @DeleteMapping("/{uploadId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteUpload(@PathVariable("uploadId") String uploadId) {
        boolean deleted = fileUploadService.deleteUpload(UUID.fromString(uploadId));
        // Requirement: return success even if file was already removed.
        return ResponseEntity.ok(new ApiResponse<>(true, "Upload deleted", deleted));
    }
}
