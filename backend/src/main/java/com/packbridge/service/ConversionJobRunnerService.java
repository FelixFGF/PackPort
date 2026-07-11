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

            // Predictable start state.
            job.setStatus(ConversionJobStatus.CREATED);
            job.setProgress(0);
            jobService.saveJob(job);

            // Background pipeline (previously in UploadController/ConversionService/modrinth export).
            if (job.getUploadId() != null) {

                // Phase 1: detect/parse basic inputs
                if (job.getModpackType() == ModpackType.UNKNOWN) {
                    job.setStatus(ConversionJobStatus.SCANNING);
                    job.setProgress(20);
                    jobService.saveJob(job);

                    // UploadController previously forced CURSEFORGE and then parsed manifest.
                    job.setModpackType(ModpackType.CURSEFORGE);
                    ManifestInfo parsed = curseForgeManifestParserService.parseManifest(job.getUploadId(), job.getJobId());
                    job.setManifestInfo(parsed);

                    job.setStatus(ConversionJobStatus.ANALYZING);
                    job.setProgress(50);
                    jobService.saveJob(job);
                } else {
                    job.setStatus(ConversionJobStatus.SCANNING);
                    job.setProgress(20);
                    jobService.saveJob(job);

                    job.setStatus(ConversionJobStatus.ANALYZING);
                    job.setProgress(50);
                    jobService.saveJob(job);
                }

                // Phase 2: convert/compute report + output naming
                job.setStatus(ConversionJobStatus.CONVERTING);
                job.setProgress(80);
                jobService.saveJob(job);

                conversionService.convert(job);
            }

            // Phase 3: export mrpack (only for CURSEFORGE uploads in existing Phase 1 implementation)
            if (job.getModpackType() == ModpackType.CURSEFORGE) {
                job.setStatus(ConversionJobStatus.CONVERTING);
                job.setProgress(90);
                jobService.saveJob(job);

                ManifestInfo manifestInfo = job.getManifestInfo();
                String outputFileName = job.getOutputFileName();

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
                job.getWarnings().add("Conversion failed: " + e.getMessage());
                jobService.saveJob(job);
            }
            e.printStackTrace();
        }
    }
}