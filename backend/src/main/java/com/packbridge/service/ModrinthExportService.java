package com.packbridge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.packbridge.config.FileStorageProperties;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModrinthDependency;
import com.packbridge.model.ModrinthIndex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

@Service
public class ModrinthExportService {

    private static final Logger logger = LoggerFactory.getLogger(ModrinthExportService.class);

    private final Path fileStorageLocation;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ModrinthExportService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();
    }

    public String exportMrpackPhase1(UUID uploadId, UUID jobId, String outputFileName, ManifestInfo manifestInfo) {
        if (uploadId == null || outputFileName == null || outputFileName.isBlank()) {
            throw new IllegalArgumentException("uploadId and outputFileName are required");
        }
        if (jobId == null) {
            throw new IllegalArgumentException("jobId is required");
        }

        // TEMP DEBUG: trace manifestInfo used for export (as requested)
        System.out.println(
                "[ModrinthExportService] exportMrpackPhase1 start (uploadId=" + uploadId + ", jobId=" + jobId + "): " +
                        "packName=" + (manifestInfo == null ? null : manifestInfo.getPackName()) + ", " +
                        "minecraftVersion=" + (manifestInfo == null ? null : manifestInfo.getMinecraftVersion()) + ", " +
                        "loader=" + (manifestInfo == null ? null : manifestInfo.getLoader()) + ", " +
                        "mods.size=" + (manifestInfo == null || manifestInfo.getMods() == null ? null : manifestInfo.getMods().size())
        );

        // Input is the CurseForge upload that was saved by FileUploadService.
        // For this phase we handle ZIP uploads only (uploaded as ".zip").
        Path inputZip = fileStorageLocation.resolve(uploadId + ".zip").normalize();
        if (!Files.exists(inputZip)) {
            throw new RuntimeException("Input zip not found for uploadId=" + uploadId + " at " + inputZip);
        }

        // ---- Minimal collision fix: store output per jobId folder ----
        // Before: <tempDir>/<outputFileName>
        // Now:    <tempDir>/<jobId>/<outputFileName>
        Path outputDir = fileStorageLocation.resolve(jobId.toString()).normalize();
        Path outputMrpack = outputDir.resolve(outputFileName).normalize();
        if (outputMrpack.getParent() != null) {
            try {
                Files.createDirectories(outputMrpack.getParent());
            } catch (IOException e) {
                throw new RuntimeException("Could not create output directory: " + outputMrpack.getParent(), e);
            }
        }

        // Always (re)create output mrpack zip
        if (Files.exists(outputMrpack)) {
            try {
                Files.delete(outputMrpack);
            } catch (IOException e) {
                throw new RuntimeException("Could not delete existing output file: " + outputMrpack, e);
            }
        }

        // Build minimal, structurally valid modrinth.index.json
        ModrinthIndex index = new ModrinthIndex();
        index.setGame("minecraft");
        index.setFormatVersion(1);

        // versionId is required in the schema; since we don't have real Modrinth versionId yet in Phase 1,
        // use a stable synthetic one derived from jobId.
        index.setVersionId("packport-" + jobId);

        // Use manifestInfo values already parsed from manifest.json
        if (manifestInfo != null) {
            index.setName(manifestInfo.getPackName());
            index.setSummary(manifestInfo.getPackVersion());

            // dependencies are optional, but some clients expect the field to exist and not be empty
            // so we provide at least minecraft + a best-effort loader key mapping.
            ModrinthDependency deps = new ModrinthDependency();

            if (manifestInfo.getMinecraftVersion() != null && !manifestInfo.getMinecraftVersion().isBlank()) {
                String minecraftKey = "minecraft";
                String minecraftConstraint = manifestInfo.getMinecraftVersion();

                // Best-effort loader mapping: keep minimal and never throw.
                String loader = manifestInfo.getLoader();
                if (loader != null) {
                    String lower = loader.toLowerCase();
                    if (lower.contains("forge")) {
                        deps.setDependencies(java.util.Map.of(
                                minecraftKey, minecraftConstraint,
                                "forge", "*"
                        ));
                    } else if (lower.contains("fabric")) {
                        deps.setDependencies(java.util.Map.of(
                                minecraftKey, minecraftConstraint,
                                "fabric", "*"
                        ));
                    } else if (lower.contains("neoforge")) {
                        deps.setDependencies(java.util.Map.of(
                                minecraftKey, minecraftConstraint,
                                "neoforge", "*"
                        ));
                    } else {
                        deps.setDependencies(java.util.Map.of(
                                minecraftKey, minecraftConstraint
                        ));
                    }
                } else {
                    deps.setDependencies(java.util.Map.of(
                            minecraftKey, minecraftConstraint
                    ));
                }
            } else {
                deps.setDependencies(Collections.emptyMap());
            }

            index.setDependencies(deps);
        } else {
            index.setName("PackPort Export");
            index.setSummary("Converted pack (phase 1)");
            ModrinthDependency deps = new ModrinthDependency();
            deps.setDependencies(Collections.emptyMap());
            index.setDependencies(deps);
        }

        // Phase 1: files[] empty. This is enough for "open" tests when overrides exist.
        // Next phase will fill files[] with real mod metadata.
        index.setFiles(Collections.emptyList());

        // Create mrpack zip
        try (ZipFile zipFile = new ZipFile(inputZip.toFile());
             OutputStream fileOut = Files.newOutputStream(outputMrpack);
             ZipOutputStream zipOut = new ZipOutputStream(fileOut, StandardCharsets.UTF_8)) {

            // 1) Write modrinth.index.json at root
            writeJsonEntry(zipOut, "modrinth.index.json", index);

            // 2) Copy full overrides/ directory from input zip into output mrpack
            // CurseForge zip from upload normally contains "overrides/..." entries.
            // We copy everything under overrides/ (including nested files).
            String overridesPrefix = "overrides/";
            var entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                String name = entry.getName();

                if (entry.isDirectory()) continue;

                if (name != null && name.startsWith(overridesPrefix)) {
                    ZipEntry outEntry = new ZipEntry(name);
                    zipOut.putNextEntry(outEntry);
                    try (var in = zipFile.getInputStream(entry)) {
                        in.transferTo(zipOut);
                    }
                    zipOut.closeEntry();
                }
            }

            zipOut.finish();
        } catch (Exception e) {
            logger.error("mrpack export phase1 failed uploadId={} output={} ", uploadId, outputMrpack, e);
            throw new RuntimeException("mrpack export failed: " + e.getMessage(), e);
        }

        // Set job.resultPath elsewhere by caller; we also return outputMrpack.toString()
        return outputMrpack.toString();
    }

    private void writeJsonEntry(ZipOutputStream zipOut, String entryName, Object value) throws IOException {
        ZipEntry entry = new ZipEntry(entryName);
        zipOut.putNextEntry(entry);

        byte[] jsonBytes = objectMapper.writeValueAsBytes(value);
        zipOut.write(jsonBytes);

        zipOut.closeEntry();
    }
}