package com.packbridge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.packbridge.config.FileStorageProperties;
import com.packbridge.dto.curseforge.CurseForgeManifestDto;
import com.packbridge.dto.curseforge.ModLoader;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ManifestMod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Enumeration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@Service
public class CurseForgeManifestParserService {

    private static final Logger logger = LoggerFactory.getLogger(CurseForgeManifestParserService.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path fileStorageLocation;

    public CurseForgeManifestParserService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();
    }

    public ManifestInfo parseManifest(UUID uploadId) {
        // IMPORTANT: This method must never throw RuntimeExceptions that bubble up to HTTP 500.
        // The frontend relies on ManifestInfo to render pack metadata after upload.
        ManifestInfo empty = new ManifestInfo();
        empty.setPackName("");
        empty.setPackVersion("");
        empty.setAuthor("");
        empty.setMinecraftVersion("");
        empty.setLoader("");
        empty.setImagePath(null);
        empty.setTotalMods(0);
        empty.setMods(List.of());

        if (uploadId == null) {
            return empty;
        }

        Path zipFilePath = fileStorageLocation.resolve(uploadId + ".zip");
        if (!Files.exists(zipFilePath)) {
            zipFilePath = fileStorageLocation.resolve(uploadId + ".mrpack");
        }

        if (!Files.exists(zipFilePath)) {
            logger.warn("parseManifest: uploaded file not found for uploadId={} (expected {})", uploadId, zipFilePath);
            return empty;
        }

        try (ZipFile zipFile = new ZipFile(zipFilePath.toFile())) {
            ZipEntry manifestEntry = findManifestEntry(zipFile);
            if (manifestEntry == null) {
                logger.warn("parseManifest: manifest.json not found for uploadId={} in {}", uploadId, zipFilePath);
                return empty;
            }

            try (InputStream inputStream = zipFile.getInputStream(manifestEntry)) {
                CurseForgeManifestDto manifestDto =
                        objectMapper.readValue(inputStream, CurseForgeManifestDto.class);

                ManifestInfo parsed = toManifestInfo(manifestDto, zipFile);

                return parsed == null ? empty : parsed;
            }
        } catch (Exception e) {
            logger.error("parseManifest failed for uploadId={} from file={}", uploadId, zipFilePath, e);
            return empty;
        }
    }

    /**
     * Robustly finds the manifest entry inside the archive.
     * Some archives may not have the exact file name ending "manifest.json" at the root,
     * or may contain additional manifest-like files. We select the first entry that matches
     * "manifest" + ".json" and prefer the one that ends with "manifest.json".
     */
    private ZipEntry findManifestEntry(ZipFile zipFile) {
        Enumeration<? extends ZipEntry> entries = zipFile.entries();

        ZipEntry best = null;
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            if (entry == null || entry.isDirectory()) {
                continue;
            }

            String name = entry.getName();
            if (name == null) {
                continue;
            }

            String lower = name.toLowerCase();

            // Prefer the exact ending, but also support cases where manifest is in a subfolder
            // or has additional path components (still ends with manifest.json).
            if (lower.endsWith("manifest.json")) {
                return entry;
            }

            // Fallback: any manifest*.json that contains "manifest" somewhere.
            // This keeps behavior robust without inventing data.
            if (lower.contains("manifest") && lower.endsWith(".json")) {
                if (best == null) {
                    best = entry;
                }
            }
        }

        return best;
    }

    private String findImagePath(ZipFile zipFile) {
        Enumeration<? extends ZipEntry> entries = zipFile.entries();
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            String name = entry.getName();
            if (!entry.isDirectory()
                    && (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".gif"))) {
                // Check if the image is in the root directory of the zip
                if (!name.contains("/")) {
                    return name;
                }
            }
        }
        return null;
    }

    private ManifestInfo toManifestInfo(CurseForgeManifestDto dto, ZipFile zipFile) {
        if (dto == null) {
            return null;
        }

        ManifestInfo manifest = new ManifestInfo();
        manifest.setPackName(dto.getName());
        manifest.setPackVersion(dto.getVersion());
        manifest.setAuthor(dto.getAuthor());
        manifest.setImagePath(findImagePath(zipFile));
        manifest.setTotalMods(dto.getFiles() == null ? 0 : dto.getFiles().size());

        if (dto.getMinecraft() != null) {
            manifest.setMinecraftVersion(dto.getMinecraft().getVersion());
            if (dto.getMinecraft().getModLoaders() != null) {
                dto.getMinecraft().getModLoaders().stream()
                        .filter(ModLoader::isPrimary)
                        .findFirst()
                        .ifPresent(modLoader -> manifest.setLoader(modLoader.getId()));
            }
        }

        manifest.setMods(
                dto.getFiles() == null ? List.of() :
                        dto.getFiles().stream().map(fileDto -> {
                            ManifestMod mod = new ManifestMod();
                            mod.setProjectId(fileDto.getProjectID());
                            mod.setFileId(fileDto.getFileID());
                            mod.setRequired(fileDto.isRequired());
                            return mod;
                        }).collect(Collectors.toList())
        );

        return manifest;
    }
}
