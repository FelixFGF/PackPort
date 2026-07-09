package com.packbridge.service;

import com.packbridge.config.FileStorageProperties;
import com.packbridge.model.CurseForgeMod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@Service
public class ModScannerService {

    private static final String ZIP_EXTENSION = ".zip";
    private static final String MRPACK_EXTENSION = ".mrpack";

    private static final Logger log = LoggerFactory.getLogger(ModScannerService.class);

    private final Path fileStorageLocation;

    public ModScannerService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();
    }

    public ScanResult scan(UUID uploadId) throws IOException {
        Path zipPath = fileStorageLocation.resolve(uploadId + ZIP_EXTENSION);
        Path mrpackPath = fileStorageLocation.resolve(uploadId + MRPACK_EXTENSION);

        boolean isZipCandidate = Files.exists(zipPath);
        boolean isMrpackCandidate = Files.exists(mrpackPath);

        // Explicit resolution: only open the archive after we confirm existence + non-zero length.
        Path archivePath = null;
        String detectedExtension = null;

        if (isZipCandidate) {
            if (Files.size(zipPath) > 0) {
                archivePath = zipPath;
                detectedExtension = ZIP_EXTENSION;
            }
        }

        if (archivePath == null && isMrpackCandidate) {
            if (Files.size(mrpackPath) > 0) {
                archivePath = mrpackPath;
                detectedExtension = MRPACK_EXTENSION;
            }
        }

        // If both candidates are present but unreadable/empty, do a best-effort alternative swap check.
        if (archivePath == null) {
            // Try alternative extension even if size check above failed.
            if (isZipCandidate) {
                long size = Files.size(zipPath);
                if (size > 0) {
                    archivePath = zipPath;
                    detectedExtension = ZIP_EXTENSION;
                }
            }
            if (archivePath == null && isMrpackCandidate) {
                long size = Files.size(mrpackPath);
                if (size > 0) {
                    archivePath = mrpackPath;
                    detectedExtension = MRPACK_EXTENSION;
                }
            }
        }

        if (archivePath == null) {
            throw new IOException(
                    "Uploaded archive not found or empty for uploadId=" + uploadId +
                            " (zipExists=" + isZipCandidate + ", mrpackExists=" + isMrpackCandidate + ", zipPath=" + zipPath + ", mrpackPath=" + mrpackPath + ")"
            );
        }

        // Ensure ZipFile only opens an existing, non-empty file.
        if (!Files.exists(archivePath) || Files.size(archivePath) <= 0) {
            throw new IOException("Archive path is not readable/non-empty at scan time. archivePath=" + archivePath);
        }

        Set<String> detectedMods = new HashSet<>();

        try (ZipFile zipFile = new ZipFile(archivePath.toFile())) {
            // Debug requirement: total number of ZIP entries
            int totalEntries = 0;
            Enumeration<? extends ZipEntry> entriesForCount = zipFile.entries();
            while (entriesForCount.hasMoreElements()) {
                totalEntries++;
                entriesForCount.nextElement();
            }

            log.info(
                    "ModScannerService: scanning uploadId={} as {} (archive={}) totalZipEntries={}",
                    uploadId, detectedExtension, archivePath, totalEntries
            );

            // Debug requirement: first 20 zip entries
            int sampleCount = 0;
            Enumeration<? extends ZipEntry> entriesForSample = zipFile.entries();
            while (entriesForSample.hasMoreElements() && sampleCount < 20) {
                ZipEntry e = entriesForSample.nextElement();
                if (e == null) continue;
                if (e.isDirectory()) continue;
                String n = e.getName();
                if (n == null) continue;
                log.info("ModScannerService: zipEntrySample[{}] {}", sampleCount, n);
                sampleCount++;
            }

            // Detect ANY .jar entry regardless of directory depth
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                if (entry == null) continue;
                if (entry.isDirectory()) continue;

                String name = entry.getName();
                if (name == null) continue;

                if (!name.toLowerCase().endsWith(".jar")) continue;

                // Debug requirement: each detected .jar full path
                log.info("ModScannerService: detected .jar path: {}", name);

                // modName = filename without extension
                String fileName = name;
                int lastSlash = fileName.lastIndexOf('/');
                if (lastSlash >= 0) fileName = fileName.substring(lastSlash + 1);

                if (fileName.toLowerCase().endsWith(".jar")) {
                    fileName = fileName.substring(0, fileName.length() - 4);
                }

                String modName = fileName;

                // Ensure detectedMods list is never empty if jar files exist
                if (modName != null && !modName.isBlank()) {
                    detectedMods.add(modName);
                }
            }
        }

        // Debug requirement: final detectedMods count
        log.info("ModScannerService: detectedModsCount={} for uploadId={}", detectedMods.size(), uploadId);

        // Unsupported mods can be empty for first-pass
        List<String> unsupportedMods = new ArrayList<>();

        return new ScanResult(new ArrayList<>(detectedMods), unsupportedMods, new ArrayList<>(), detectedExtension);
    }

    public static class ScanResult {
        private final List<String> detectedMods;
        private final List<String> unsupportedMods;
        private final List<CurseForgeMod> curseForgeMods;
        private final String detectedExtension;

        public ScanResult(List<String> detectedMods, List<String> unsupportedMods, List<CurseForgeMod> curseForgeMods, String detectedExtension) {
            this.detectedMods = detectedMods;
            this.unsupportedMods = unsupportedMods;
            this.curseForgeMods = curseForgeMods;
            this.detectedExtension = detectedExtension;
        }

        public List<String> getDetectedMods() {
            return detectedMods;
        }

        public List<String> getUnsupportedMods() {
            return unsupportedMods;
        }

        public List<CurseForgeMod> getCurseForgeMods() {
            return curseForgeMods;
        }

        public String getDetectedExtension() {
            return detectedExtension;
        }
    }
}