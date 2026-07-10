package com.packbridge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.packbridge.config.FileStorageProperties;
import com.packbridge.client.curseforge.CurseForgeClient;
import com.packbridge.client.modrinth.ModrinthClient;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ModrinthDependency;
import com.packbridge.model.ModrinthFile;
import com.packbridge.model.ModrinthIndex;
import com.packbridge.service.modrinth.CurseForgeModResolutionService;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

@Service
public class ModrinthExportService {

    private static final Logger logger = LoggerFactory.getLogger(ModrinthExportService.class);

    private final Path fileStorageLocation;
    private final ObjectMapper objectMapper;

    private final CurseForgeModResolutionService curseForgeModResolutionService;

    public ModrinthExportService(
            FileStorageProperties fileStorageProperties,
            RestClient curseForgeRestClient,
            RestClient modrinthRestClient
    ) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();

        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules();
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Build clients + resolution service inside export service constructor
        // (keine Refactorings in unrelated components; ModrinthExportService bleibt Coordinator).
        var curseForgeClient = new CurseForgeClient(curseForgeRestClient, this.objectMapper);
        var modrinthClient = new ModrinthClient(modrinthRestClient, this.objectMapper);

        this.curseForgeModResolutionService = new CurseForgeModResolutionService(curseForgeClient, modrinthClient);
    }

    public String exportMrpackPhase1(UUID uploadId, UUID jobId, String outputFileName, ManifestInfo manifestInfo) {
        if (uploadId == null || outputFileName == null || outputFileName.isBlank()) {
            throw new IllegalArgumentException("uploadId and outputFileName are required");
        }
        if (jobId == null) {
            throw new IllegalArgumentException("jobId is required");
        }

        System.out.println(
                "[ModrinthExportService] exportMrpackPhase1 start (uploadId=" + uploadId + ", jobId=" + jobId + "): " +
                        "packName=" + (manifestInfo == null ? null : manifestInfo.getPackName()) + ", " +
                        "minecraftVersion=" + (manifestInfo == null ? null : manifestInfo.getMinecraftVersion()) + ", " +
                        "loader=" + (manifestInfo == null ? null : manifestInfo.getLoader()) + ", " +
                        "mods.size=" + (manifestInfo == null || manifestInfo.getMods() == null ? null : manifestInfo.getMods().size())
        );

        // Input is the CurseForge upload that was saved by FileUploadService.
        Path jobDir = fileStorageLocation.resolve(jobId.toString()).normalize();

        Path inputZip = jobDir.resolve(uploadId + ".zip").normalize();
        Path inputMrpack = jobDir.resolve(uploadId + ".mrpack").normalize();

        Path input = inputZip;
        if (!Files.exists(inputZip)) {
            input = inputMrpack;
        }

        if (!Files.exists(input)) {
            throw new RuntimeException("Input file not found for uploadId=" + uploadId + " at " + input);
        }

        // Output stored per jobId folder
        Path outputDir = fileStorageLocation.resolve(jobId.toString()).normalize();
        Path outputMrpack = outputDir.resolve(outputFileName).normalize();
        if (outputMrpack.getParent() != null) {
            try {
                Files.createDirectories(outputMrpack.getParent());
            } catch (IOException e) {
                throw new RuntimeException("Could not create output directory: " + outputMrpack.getParent(), e);
            }
        }

        if (Files.exists(outputMrpack)) {
            try {
                Files.delete(outputMrpack);
            } catch (IOException e) {
                throw new RuntimeException("Could not delete existing output file: " + outputMrpack, e);
            }
        }

        // Build modrinth.index.json
        ModrinthIndex index = new ModrinthIndex();
        index.setGame("minecraft");
        index.setFormatVersion(1);
        index.setVersionId("packport-" + jobId);

        if (manifestInfo != null) {
            index.setName(manifestInfo.getPackName());
            index.setSummary(manifestInfo.getPackVersion());

            // dependencies optional
            ModrinthDependency deps = new ModrinthDependency();
            if (manifestInfo.getMinecraftVersion() != null && !manifestInfo.getMinecraftVersion().isBlank()) {
                // keep existing best-effort behavior
                String minecraftKey = "minecraft";
                String minecraftConstraint = manifestInfo.getMinecraftVersion();
                String loader = manifestInfo.getLoader();

                if (loader != null) {
                    String lower = loader.toLowerCase();
                    if (lower.contains("forge")) {
                        deps.setDependencies(java.util.Map.of(minecraftKey, minecraftConstraint, "forge", "*"));
                    } else if (lower.contains("fabric")) {
                        deps.setDependencies(java.util.Map.of(minecraftKey, minecraftConstraint, "fabric", "*"));
                    } else if (lower.contains("neoforge")) {
                        deps.setDependencies(java.util.Map.of(minecraftKey, minecraftConstraint, "neoforge", "*"));
                    } else {
                        deps.setDependencies(java.util.Map.of(minecraftKey, minecraftConstraint));
                    }
                } else {
                    deps.setDependencies(java.util.Map.of(minecraftKey, minecraftConstraint));
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

        // -------- REAL FIX: fill files[] --------
        List<ModrinthFile> resolvedFiles = List.of();
        if (manifestInfo != null && manifestInfo.getMods() != null) {
            var out = new java.util.ArrayList<ModrinthFile>();
            for (var m : manifestInfo.getMods()) {
                out.addAll(curseForgeModResolutionService.resolveToModrinthFiles(m, manifestInfo));
            }
            resolvedFiles = out;
        }
        index.setFiles(resolvedFiles);

        try (ZipFile zipFile = new ZipFile(input.toFile());
             OutputStream fileOut = Files.newOutputStream(outputMrpack);
             ZipOutputStream zipOut = new ZipOutputStream(fileOut, StandardCharsets.UTF_8)) {

            writeJsonEntry(zipOut, "modrinth.index.json", index);

            // Copy full overrides/ directory from input zip into output mrpack
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