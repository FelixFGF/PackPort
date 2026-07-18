package com.packbridge.service;

import com.packbridge.model.ModpackType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Detects modpack type based on archive contents.
 *
 * Detection is based on a priority order:
 * 1) CurseForge (manifest.json)
 * 2) Modrinth (modrinth.index.json)
 * 3) Prism Launcher / MultiMC (mmc-pack.json or instance.cfg)
 * 4) Unknown
 *
 * Detection-only: does NOT parse/convert mods.
 */
@Service
public class ModpackDetectorService {

    private static final Logger log = LoggerFactory.getLogger(ModpackDetectorService.class);

    private static final String ZIP_EXTENSION = ".zip";
    private static final String MRPACK_EXTENSION = ".mrpack";

    // Intentionally lightweight "validation" to avoid forcing JSON parsing dependencies.
    private static final Pattern CURSEFORGE_HAS_MINECRAFT = Pattern.compile("\"minecraft\"\\s*:");
    private static final Pattern CURSEFORGE_HAS_FILES = Pattern.compile("\"files\"\\s*:");

    private final Path fileStorageLocation;

    public ModpackDetectorService(com.packbridge.config.FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();
    }

    /**
     * Backward-compatible legacy detection:
     * <tempDir>/<uploadId>.zip|.mrpack
     */
    public ModpackType detect(UUID uploadId) throws IOException {
        if (uploadId == null) return ModpackType.UNKNOWN;

        Path zipPath = fileStorageLocation.resolve(uploadId + ZIP_EXTENSION);
        Path mrpackPath = fileStorageLocation.resolve(uploadId + MRPACK_EXTENSION);

        return detectFromArchivePaths(uploadId, zipPath, mrpackPath);
    }

    /**
     * New detection:
     * 1) <tempDir>/<jobId>/<uploadId>.zip|.mrpack
     * 2) fallback to <tempDir>/<uploadId>.zip|.mrpack
     */
    public ModpackType detect(UUID uploadId, UUID jobId) throws IOException {
        if (uploadId == null) return ModpackType.UNKNOWN;

        // Prefer job-aligned location first.
        Path zipPathJob = null;
        Path mrpackPathJob = null;
        if (jobId != null) {
            Path jobDir = fileStorageLocation.resolve(jobId.toString()).normalize();
            zipPathJob = jobDir.resolve(uploadId + ZIP_EXTENSION).normalize();
            mrpackPathJob = jobDir.resolve(uploadId + MRPACK_EXTENSION).normalize();
        }

        // Legacy fallback.
        Path zipPathLegacy = fileStorageLocation.resolve(uploadId + ZIP_EXTENSION);
        Path mrpackPathLegacy = fileStorageLocation.resolve(uploadId + MRPACK_EXTENSION);

        // Job location if readable; otherwise legacy.
        if (isReadableNonEmpty(zipPathJob) || isReadableNonEmpty(mrpackPathJob)) {
            return detectFromArchivePaths(uploadId,
                    zipPathJob,
                    mrpackPathJob);
        }

        return detectFromArchivePaths(uploadId,
                zipPathLegacy,
                mrpackPathLegacy);
    }

    private ModpackType detectFromArchivePaths(UUID uploadId, Path zipPath, Path mrpackPath) throws IOException {
        // Prefer zip if it exists and is non-empty; otherwise try mrpack.
        Path archivePath = null;
        String archiveKind = null;

        if (isReadableNonEmpty(zipPath)) {
            archivePath = zipPath;
            archiveKind = ZIP_EXTENSION;
        } else if (isReadableNonEmpty(mrpackPath)) {
            archivePath = mrpackPath;
            archiveKind = MRPACK_EXTENSION;
        }

        if (archivePath == null) {
            log.warn("ModpackDetectorService: no readable uploaded archive for uploadId={} (zip={}, mrpack={})",
                    uploadId, zipPath, mrpackPath);
            return ModpackType.UNKNOWN;
        }

        try (ZipFile zipFile = new ZipFile(archivePath.toFile())) {
            // CurseForge: manifest.json exists AND contains "minecraft" and "files"
            if (isCurseForge(zipFile)) {
                log.info("ModpackDetectorService: detected CURSEFORGE for uploadId={} using archive={}", uploadId, archiveKind);
                return ModpackType.CURSEFORGE;
            }

            // Modrinth: modrinth.index.json exists
            if (isModrinth(zipFile)) {
                log.info("ModpackDetectorService: detected MODRINTH for uploadId={} using archive={}", uploadId, archiveKind);
                return ModpackType.MODRINTH;
            }

            // Prism/MultiMC: mmc-pack.json OR instance.cfg exists
            if (isPrism(zipFile)) {
                log.info("ModpackDetectorService: detected PRISM for uploadId={} using archive={}", uploadId, archiveKind);
                return ModpackType.PRISM;
            }

            log.info("ModpackDetectorService: detected UNKNOWN for uploadId={} using archive={}", uploadId, archiveKind);
            return ModpackType.UNKNOWN;
        }
    }

    private boolean isReadableNonEmpty(Path p) {
        if (p == null) {
            return false;
        }

        if (!Files.exists(p) || !Files.isRegularFile(p)) {
            return false;
        }

        try {
            return Files.size(p) > 0;
        } catch (IOException e) {
            log.warn("Unable to determine file size for {}", p, e);
            return false;
        }
    }

    private boolean isCurseForge(ZipFile zipFile) throws IOException {
        // "manifest.json exists" (path may vary with nesting)
        ZipEntry manifestEntry = findEntryBySuffix(zipFile, "manifest.json");
        if (manifestEntry == null) return false;

        String manifestText = readEntryAsString(zipFile, manifestEntry);
        if (manifestText == null) return false;

        // Required validation:
        // contains "minecraft" and "files"
        return CURSEFORGE_HAS_MINECRAFT.matcher(manifestText).find()
                && CURSEFORGE_HAS_FILES.matcher(manifestText).find();
    }

    private boolean isModrinth(ZipFile zipFile) {
        // "modrinth.index.json exists"
        return findEntryBySuffix(zipFile, "modrinth.index.json") != null;
    }

    private boolean isPrism(ZipFile zipFile) {
        // "mmc-pack.json" OR "instance.cfg" exists
        return findEntryBySuffix(zipFile, "mmc-pack.json") != null
                || findEntryBySuffix(zipFile, "instance.cfg") != null;
    }

    private ZipEntry findEntryBySuffix(ZipFile zipFile, String suffix) {
        if (zipFile == null || suffix == null) return null;

        var entries = zipFile.entries();
        while (entries.hasMoreElements()) {
            ZipEntry e = entries.nextElement();
            if (e == null) continue;
            if (e.isDirectory()) continue;

            String name = e.getName();
            if (name == null) continue;

            // Normalize: zip entries use '/' separators
            if (name.toLowerCase().endsWith(suffix.toLowerCase())) {
                return e;
            }
        }
        return null;
    }

    private String readEntryAsString(ZipFile zipFile, ZipEntry entry) throws IOException {
        if (zipFile == null || entry == null) return null;

        long size = entry.getSize();
        // Avoid extreme reads; manifests should be small.
        if (size > 1024 * 1024) {
            log.warn("ModpackDetectorService: manifest entry too large ({} bytes). entryName={}", size, entry.getName());
            return null;
        }

        byte[] bytes;
        try (var in = zipFile.getInputStream(entry)) {
            bytes = in.readAllBytes();
        }

        return new String(bytes, StandardCharsets.UTF_8);
    }
}