package com.packbridge.service;

import com.packbridge.model.ConversionJob;
import com.packbridge.model.ConversionJobStatus;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModpackType;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class ConversionJobRunnerService {

    private final JobService jobService;
    private final ConversionService conversionService;
    private final CurseForgeManifestParserService curseForgeManifestParserService;
    private final ModrinthExportService modrinthExportService;

    public ConversionJobRunnerService(
            JobService jobService,
            ConversionService conversionService,
            CurseForgeManifestParserService curseForgeManifestParserService,
            ModrinthExportService modrinthExportService
    ) {
        this.jobService = jobService;
        this.conversionService = conversionService;
        this.curseForgeManifestParserService = curseForgeManifestParserService;
        this.modrinthExportService = modrinthExportService;
    }

    public void runAsync(ConversionJob job) {
        CompletableFuture.runAsync(() -> run(job));
    }

    /**
     * Executes the heavy conversion workflow and persists progress on the job.
     * Keeps the existing logic order that was previously inside UploadController.
     */
    public void run(ConversionJob job) {
        try {
            if (job == null) return;

            // Ensure we start from a predictable state; CREATED should already be set by controller.
            job.setStatus(ConversionJobStatus.CREATED);
            jobService.saveJob(job);

            // Background pipeline (previously in UploadController/ConversionService/modrinth export).
            if (job.getUploadId() != null) {
                // If type wasn't set earlier, ensure consistent behavior.
                if (job.getModpackType() == ModpackType.UNKNOWN) {
                    // UploadController previously forced CURSEFORGE and then parsed manifest.
                    job.setModpackType(ModpackType.CURSEFORGE);
                    ManifestInfo parsed = curseForgeManifestParserService.parseManifest(job.getUploadId(), job.getJobId());
                    job.setManifestInfo(parsed);
                }

                // conversionService.convert(job) sets SCANNING -> DONE and fills fields.
                // It also computes outputFileName via buildExportFileName.
                jobService.saveJob(job);
                conversionService.convert(job);
            }

            // Export only for CURSEFORGE uploads in the existing Phase 1 implementation.
            if (job.getModpackType() == ModpackType.CURSEFORGE) {
                ManifestInfo manifestInfo = job.getManifestInfo();

                String outputFileName = job.getOutputFileName();
                // outputFileName is expected to include suffix + ".mrpack"
                // as computed by ConversionService.
                String createdOutput = modrinthExportService.exportMrpackPhase1(
                        job.getUploadId(),
                        job.getJobId(),
                        outputFileName,
                        manifestInfo
                );

                job.setOutputFileName(outputFileName);
                job.setResultPath(createdOutput);
            }

            job.setStatus(ConversionJobStatus.DONE);
            job.setProgress(100);
            jobService.saveJob(job);

        } catch (Exception e) {
            if (job != null) {
                job.setStatus(ConversionJobStatus.FAILED);
                job.setProgress(100);
                // Job currently has no "error message" field; warnings can be used.
                // Avoid breaking DTO/polling contract: warnings is already returned by JobController.
                job.getWarnings().add("Conversion failed: " + e.getMessage());
                jobService.saveJob(job);
            }
            // Keep stack trace in logs for debugging.
            e.printStackTrace();
        }
    }
}