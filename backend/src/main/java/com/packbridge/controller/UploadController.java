package com.packbridge.controller;

import com.packbridge.config.FileStorageProperties;
import com.packbridge.dto.ApiResponse;
import com.packbridge.dto.UploadResponse;
import com.packbridge.model.ConversionJobStatus;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModpackType;
import com.packbridge.service.CurseForgeManifestParserService;
import com.packbridge.service.ConversionService;
import com.packbridge.service.FileUploadService;
import com.packbridge.service.JobService;
import com.packbridge.service.ModrinthExportService;

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
    private final ConversionService conversionService;
    private final CurseForgeManifestParserService curseForgeManifestParserService;
    private final ModrinthExportService modrinthExportService;

    private final Path fileStorageLocation;

    public UploadController(
            FileUploadService fileUploadService,
            JobService jobService,
            ConversionService conversionService,
            CurseForgeManifestParserService curseForgeManifestParserService,
            ModrinthExportService modrinthExportService,
            FileStorageProperties fileStorageProperties
    ) {
        this.fileUploadService = fileUploadService;
        this.jobService = jobService;
        this.conversionService = conversionService;
        this.curseForgeManifestParserService = curseForgeManifestParserService;
        this.modrinthExportService = modrinthExportService;
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

        // Source of truth for the wizard fields stays in ConversionService.
        // However, we trigger Modrinth Phase 1 export immediately after conversion,
        // so DownloadController can serve the generated .mrpack.
        conversionService.convert(job);

        // Ensure correct type and manifestInfo are present before export.
        // ConversionService already fills these for CURSEFORGE uploads.
        if (job.getModpackType() == ModpackType.UNKNOWN) {
            job.setModpackType(ModpackType.CURSEFORGE);

            // If we force modpackType here, ConversionService did NOT parse manifestInfo.
            // Parse now so UI/export/download all use the same real metadata.
            ManifestInfo parsed = curseForgeManifestParserService.parseManifest(uploadId, job.getJobId());

            System.out.println(
                    "[UploadController] after parseManifest (uploadId=" + uploadId + ", jobId=" + job.getJobId() + "): " +
                            "packName=" + (parsed == null ? null : parsed.getPackName()) + ", " +
                            "minecraftVersion=" + (parsed == null ? null : parsed.getMinecraftVersion()) + ", " +
                            "loader=" + (parsed == null ? null : parsed.getLoader()) + ", " +
                            "mods.size=" + (parsed == null || parsed.getMods() == null ? null : parsed.getMods().size())
            );

            job.setManifestInfo(parsed);

            System.out.println(
                    "[UploadController] after job.setManifestInfo (jobId=" + job.getJobId() + "): " +
                            "packName=" + (job.getManifestInfo() == null ? null : job.getManifestInfo().getPackName()) + ", " +
                            "minecraftVersion=" + (job.getManifestInfo() == null ? null : job.getManifestInfo().getMinecraftVersion()) + ", " +
                            "loader=" + (job.getManifestInfo() == null ? null : job.getManifestInfo().getLoader()) + ", " +
                            "mods.size=" + (job.getManifestInfo() == null || job.getManifestInfo().getMods() == null ? null : job.getManifestInfo().getMods().size())
            );
        }

        ManifestInfo manifestInfo = job.getManifestInfo();

        // Export only for CURSEFORGE uploads in this Phase 1 implementation.
        if (job.getModpackType() == ModpackType.CURSEFORGE) {
            // IMPORTANT FIX (outputFileName provenance):
            // Never trust job.outputFileName here; derive deterministically from wizard inputs:
            // exportNameBase (if provided) -> manifest.packName -> jobId fallback
            // and apply required suffix/extension.
            String suffix = "_(PackPort.ddns.net)";

            String originalBaseName;
            if (job.getExportNameBase() != null && !job.getExportNameBase().isBlank()) {
                originalBaseName = job.getExportNameBase().trim();
            } else if (manifestInfo != null
                    && manifestInfo.getPackName() != null
                    && !manifestInfo.getPackName().isBlank()) {
                originalBaseName = manifestInfo.getPackName();
            } else {
                originalBaseName = job.getJobId().toString();
            }

            // prevent double extensions if base already contains them
            String lowerBase = originalBaseName.toLowerCase();
            if (lowerBase.endsWith(".zip") || lowerBase.endsWith(".mrpack")) {
                if (lowerBase.endsWith(".zip")) {
                    originalBaseName = originalBaseName.substring(0, originalBaseName.length() - ".zip".length());
                } else {
                    originalBaseName = originalBaseName.substring(0, originalBaseName.length() - ".mrpack".length());
                }
            }

            String outputFileName = originalBaseName + suffix + ".mrpack";

            System.out.println(
                    "[UploadController] before exportMrpackPhase1 (jobId=" + job.getJobId() + "): " +
                            "packName=" + (manifestInfo == null ? null : manifestInfo.getPackName()) + ", " +
                            "minecraftVersion=" + (manifestInfo == null ? null : manifestInfo.getMinecraftVersion()) + ", " +
                            "loader=" + (manifestInfo == null ? null : manifestInfo.getLoader()) + ", " +
                            "mods.size=" + (manifestInfo == null || manifestInfo.getMods() == null ? null : manifestInfo.getMods().size()) + ", " +
                            "outputFileName=" + outputFileName
            );

            String createdOutput = modrinthExportService.exportMrpackPhase1(
                    uploadId,
                    job.getJobId(),
                    outputFileName,
                    manifestInfo
            );

            // Keep job output filename + result path consistent with stored file.
            job.setOutputFileName(outputFileName);
            job.setResultPath(createdOutput);
        }

        jobService.saveJob(job);

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
