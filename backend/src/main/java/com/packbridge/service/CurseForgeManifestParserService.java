package com.packbridge.service;

import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.stream.StreamSupport;
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
                // Keep DTO deserialization for compatibility, but additionally use JsonNode fallback
                // to avoid brittle field-mapping issues.
                CurseForgeManifestDto manifestDto =
                        objectMapper.readValue(inputStream, CurseForgeManifestDto.class);

                ManifestInfo parsed = toManifestInfoWithFallback(manifestDto, zipFile, manifestEntry);
                return parsed == null ? empty : parsed;
            }
        } catch (Exception e) {
            logger.error("parseManifest failed for uploadId={} from file={}", uploadId, zipFilePath, e);
            return empty;
        }
    }

    public ManifestInfo parseManifest(UUID uploadId, UUID jobId) {
        // IMPORTANT: This method must never throw RuntimeExceptions that bubble up to HTTP 500.
        ManifestInfo empty = new ManifestInfo();
        empty.setPackName("");
        empty.setPackVersion("");
        empty.setAuthor("");
        empty.setMinecraftVersion("");
        empty.setLoader("");
        empty.setImagePath(null);
        empty.setTotalMods(0);
        empty.setMods(List.of());

        if (uploadId == null || jobId == null) {
            return empty;
        }

        // New unified layout: <tempDir>/<jobId>/<uploadId>.zip OR .mrpack
        Path jobDir = fileStorageLocation.resolve(jobId.toString()).normalize();

        Path zipFilePath = jobDir.resolve(uploadId + ".zip");
        if (!Files.exists(zipFilePath)) {
            zipFilePath = jobDir.resolve(uploadId + ".mrpack");
        }

        if (!Files.exists(zipFilePath)) {
            logger.warn("parseManifest(job): uploaded file not found for uploadId={} jobId={} (expected {})", uploadId, jobId, zipFilePath);
            return empty;
        }

        try (ZipFile zipFile = new ZipFile(zipFilePath.toFile())) {
            ZipEntry manifestEntry = findManifestEntry(zipFile);
            if (manifestEntry == null) {
                logger.warn("parseManifest(job): manifest.json not found for uploadId={} jobId={} in {}", uploadId, jobId, zipFilePath);
                return empty;
            }

            try (InputStream inputStream = zipFile.getInputStream(manifestEntry)) {
                CurseForgeManifestDto manifestDto =
                        objectMapper.readValue(inputStream, CurseForgeManifestDto.class);

                ManifestInfo parsed = toManifestInfoWithFallback(manifestDto, zipFile, manifestEntry);
                return parsed == null ? empty : parsed;
            }
        } catch (Exception e) {
            logger.error("parseManifest(job) failed for uploadId={} jobId={} from file={}", uploadId, jobId, zipFilePath, e);
            return empty;
        }
    }

    private ManifestInfo toManifestInfoWithFallback(CurseForgeManifestDto manifestDto, ZipFile zipFile, ZipEntry manifestEntry) {
        ManifestInfo dtoBased = toManifestInfo(manifestDto, zipFile);
        if (dtoBased == null) {
            return null;
        }

        boolean looksEmpty =
                (dtoBased.getPackName() == null || dtoBased.getPackName().isBlank()) &&
                        (dtoBased.getMinecraftVersion() == null || dtoBased.getMinecraftVersion().isBlank()) &&
                        (dtoBased.getLoader() == null || dtoBased.getLoader().isBlank()) &&
                        (dtoBased.getTotalMods() == 0);

        if (!looksEmpty) {
            return dtoBased;
        }

        // Fallback: parse required values from manifest.json directly with JsonNode.
        try (InputStream inputStream = zipFile.getInputStream(manifestEntry)) {
            JsonNode root = objectMapper.readTree(inputStream);
            ManifestInfo manifest = new ManifestInfo();

            manifest.setPackName(textOrEmpty(root, "name", dtoBased.getPackName()));
            manifest.setPackVersion(textOrEmpty(root, "version", dtoBased.getPackVersion()));
            manifest.setAuthor(textOrEmpty(root, "author", dtoBased.getAuthor()));
            manifest.setImagePath(findImagePath(zipFile));

            // minecraft
            JsonNode minecraft = root.get("minecraft");
            if (minecraft != null && minecraft.isObject()) {
                manifest.setMinecraftVersion(textOrEmpty(minecraft, "version", dtoBased.getMinecraftVersion()));

                // modLoaders
                JsonNode modLoadersNode = minecraft.get("modLoaders");
                String primaryLoaderId = "";
                if (modLoadersNode != null && modLoadersNode.isArray()) {
                    for (JsonNode ml : modLoadersNode) {
                        boolean primary = ml.path("primary").asBoolean(false);
                        if (primary) {
                            primaryLoaderId = textOrEmpty(ml, "id", "");
                            if (!primaryLoaderId.isBlank()) break;
                        }
                    }
                    if (primaryLoaderId.isBlank()) {
                        // best-effort: take first loader id
                        for (JsonNode ml : modLoadersNode) {
                            String id = textOrEmpty(ml, "id", "");
                            if (!id.isBlank()) {
                                primaryLoaderId = id;
                                break;
                            }
                        }
                    }
                }
                manifest.setLoader(primaryLoaderId);
            } else {
                // also tolerate "minecraftVersion"/other custom structures if present
                manifest.setMinecraftVersion(textOrEmpty(root, "minecraftVersion", dtoBased.getMinecraftVersion()));
            }

            // files -> totalMods
            JsonNode filesNode = root.get("files");
            int totalMods = 0;
            if (filesNode != null && filesNode.isArray()) {
                totalMods = filesNode.size();
            }
            manifest.setTotalMods(totalMods);

            // mods list: keep lightweight (projectId/fileId/required) matching existing ManifestMod model
            if (filesNode != null && filesNode.isArray()) {
                manifest.setMods(toModsFromFilesNode(filesNode));
            } else {
                manifest.setMods(List.of());
            }

            return manifest;
        } catch (Exception e) {
            logger.error("parseManifest fallback JsonNode failed (uploadId manifests empty scenario)", e);
            return dtoBased;
        }
    }

    private List<ManifestMod> toModsFromFilesNode(JsonNode filesNode) {
        if (filesNode == null || !filesNode.isArray()) return List.of();

        // Build ManifestMod list with the minimum fields used by UI later.
        return StreamSupport.stream(filesNode.spliterator(), false)
                .map(node -> {
                    ManifestMod mod = new ManifestMod();

                    // projectID/fileID are ints in ManifestMod
                    // Default values per requirement.
                    mod.setProjectId(node.hasNonNull("projectID") ? node.get("projectID").asInt(0) : 0);
                    mod.setFileId(node.hasNonNull("fileID") ? node.get("fileID").asInt(0) : 0);

                    // Default: required=true if missing.
                    JsonNode requiredNode = node.get("required");
                    boolean required = requiredNode == null || requiredNode.isNull() ? true : requiredNode.asBoolean(true);
                    mod.setRequired(required);

                    return mod;
                })
                .collect(Collectors.toList());
    }

    private String textOrEmpty(JsonNode node, String field, String fallback) {
        if (node == null) return fallback == null ? "" : fallback;
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return fallback == null ? "" : fallback;
        String s = v.asText("");
        if (s == null) return fallback == null ? "" : fallback;
        return s;
    }

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

            if (lower.endsWith("manifest.json")) {
                return entry;
            }

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
