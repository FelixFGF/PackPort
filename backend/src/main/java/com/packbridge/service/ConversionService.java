package com.packbridge.service;

import com.packbridge.dto.ConversionReportDto;
import com.packbridge.dto.ConversionRequestDto;
import com.packbridge.dto.ConversionResponseDto;
import com.packbridge.dto.UnsupportedModDto;
import com.packbridge.model.ConversionJob;
import com.packbridge.model.ConversionJobStatus;
import com.packbridge.model.ConversionResult;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModpackType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ConversionService {

    private final CurseForgeManifestParserService curseForgeManifestParserService;
    private final ModpackDetectorService modpackDetectorService;
    private final ModScannerService modScannerService;

    public ConversionService(
            CurseForgeManifestParserService curseForgeManifestParserService,
            ModpackDetectorService modpackDetectorService,
            ModScannerService modScannerService
    ) {
        this.curseForgeManifestParserService = curseForgeManifestParserService;
        this.modpackDetectorService = modpackDetectorService;
        this.modScannerService = modScannerService;
    }

    /**
     * Pipeline conversion used by the wizard job flow.
     * Drives CREATED -> SCANNING -> DONE so GET /api/job/{jobId} returns filled fields.
     */
    public ConversionResult convert(ConversionJob job) {
        if (job == null) {
            return new ConversionResult(List.of(), List.of(), null);
        }

        // CREATED -> SCANNING
        job.setStatus(ConversionJobStatus.SCANNING);
        job.setProgress(10);

        if (job.getUploadId() != null) {
            // TEMP DEBUG: trace wizard fields before outputFileName computation
            String packName = (job.getManifestInfo() == null) ? null : job.getManifestInfo().getPackName();
            String exportNameBase = job.getExportNameBase();
            String existingOutputFileName = job.getOutputFileName();

            System.out.println(
                    "[ConversionService] convert.before buildExportFileName " +
                            "exportNameBase=" + exportNameBase + ", " +
                            "manifest.packName=" + packName + ", " +
                            "job.outputFileName(existing)=" + existingOutputFileName
            );

            // Ensure modpackType is correctly detected (backend source of truth).
            try {
                ModpackType detectedType = modpackDetectorService.detect(job.getUploadId());
                job.setModpackType(detectedType);
            } catch (Exception e) {
                job.setModpackType(ModpackType.UNKNOWN);
            }

            // Detect mods
            try {
                ModScannerService.ScanResult scanResult = modScannerService.scan(job.getUploadId());
                job.setDetectedMods(scanResult.getDetectedMods());
            } catch (Exception e) {
                job.setDetectedMods(List.of());
            }

            // Parse manifest for CURSEFORGE only (so manifestInfo contains real values after upload).
            if (job.getModpackType() == ModpackType.CURSEFORGE) {
                ManifestInfo manifestInfo = curseForgeManifestParserService.parseManifest(job.getUploadId());
                job.setManifestInfo(manifestInfo);
            }
        }

        // SCANNING -> DONE
        job.setProgress(100);
        job.setStatus(ConversionJobStatus.DONE);

        // In-memory simulation: convert detected mods into converted/removed.
        List<String> detectedMods = job.getDetectedMods();

        Set<String> unsupported =
                new HashSet<>(job.getUnsupportedMods() == null ? List.of() : job.getUnsupportedMods());

        List<String> convertedMods = new ArrayList<>();
        List<String> removedMods = new ArrayList<>();

        for (String mod : detectedMods) {
            if (unsupported.contains(mod)) {
                removedMods.add(mod);
            } else {
                convertedMods.add(mod);
            }
        }

        job.setConvertedMods(convertedMods);
        job.setRemovedMods(removedMods);

        String outputFileName = buildExportFileName(job);
        job.setOutputFileName(outputFileName);

        System.out.println(
                "[ConversionService] convert.after buildExportFileName finalOutputFileName=" + outputFileName
        );

        return new ConversionResult(convertedMods, removedMods, outputFileName);
    }

    private String buildExportFileName(ConversionJob job) {
        String suffix = "_(PackPort.Netlify.App)";

        String originalBaseName = null;
        String extension = null;

        String existing = job.getOutputFileName();
        if (existing != null) {
            String lower = existing.toLowerCase();
            if (lower.endsWith(".zip")) {
                extension = ".zip";
                originalBaseName = existing.substring(0, existing.length() - ".zip".length());
            } else if (lower.endsWith(".mrpack")) {
                extension = ".mrpack";
                originalBaseName = existing.substring(0, existing.length() - ".mrpack".length());
            }
        }

        if (originalBaseName == null) {
            // 1) exportNameBase override (if provided)
            if (job.getExportNameBase() != null && !job.getExportNameBase().isBlank()) {
                originalBaseName = job.getExportNameBase().trim();
                extension = ".mrpack";
            } else {
                // 2) manifest packName
                if (job.getManifestInfo() != null
                        && job.getManifestInfo().getPackName() != null
                        && !job.getManifestInfo().getPackName().isBlank()) {
                    originalBaseName = job.getManifestInfo().getPackName();
                } else {
                    // 3) UUID fallback
                    originalBaseName = job.getJobId().toString();
                }
                extension = ".mrpack";
            }
        }

        // prevent double extensions
        String lowerBase = originalBaseName.toLowerCase();
        if (lowerBase.endsWith(".zip") || lowerBase.endsWith(".mrpack")) {
            if (lowerBase.endsWith(".zip")) {
                originalBaseName = originalBaseName.substring(0, originalBaseName.length() - ".zip".length());
            } else {
                originalBaseName = originalBaseName.substring(0, originalBaseName.length() - ".mrpack".length());
            }
        }

        // TEMP DEBUG: trace selected base/ext and output naming inputs
        System.out.println(
                "[ConversionService] buildExportFileName selected originalBaseName=" + originalBaseName +
                        ", extension=" + extension
        );

        String finalOutputFileName = originalBaseName + suffix + extension;

        // TEMP DEBUG: trace final output filename
        System.out.println(
                "[ConversionService] buildExportFileName finalOutputFileName=" + finalOutputFileName
        );

        return finalOutputFileName;
    }

    /**
     * Backward-compatible endpoint adapter required by {@code ConversionController}.
     */
    public ConversionResponseDto convert(ConversionRequestDto dto) {
        String targetPlatform = dto.getTargetPlatform() == null ? null : dto.getTargetPlatform().name();

        ConversionReportDto report = new ConversionReportDto(
                "NOT_IMPLEMENTED",
                null,
                targetPlatform,
                List.<UnsupportedModDto>of(),
                null
        );

        return new ConversionResponseDto(report);
    }
}