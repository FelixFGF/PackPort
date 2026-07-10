package com.packbridge.service.modrinth;

import com.fasterxml.jackson.databind.JsonNode;
import com.packbridge.client.curseforge.CurseForgeClient;
import com.packbridge.client.curseforge.dto.CurseForgeDownloadUrlResponseDto;
import com.packbridge.client.curseforge.dto.CurseForgeModFileResponseDto;
import com.packbridge.client.modrinth.ModrinthClient;
import com.packbridge.client.modrinth.dto.ModrinthVersionResponseDto;
import com.packbridge.model.ManifestInfo;
import com.packbridge.model.ManifestMod;
import com.packbridge.model.ModrinthFile;
import com.packbridge.model.ModrinthHashes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class CurseForgeModResolutionService {

    private static final Logger logger = LoggerFactory.getLogger(CurseForgeModResolutionService.class);

    private final CurseForgeClient curseForgeClient;
    private final ModrinthClient modrinthClient;

    // Cache: curseforge projectId/fileId -> resolved modrinth files[]
    private final Map<String, List<ModrinthFile>> indexFilesCache = new ConcurrentHashMap<>();

    public CurseForgeModResolutionService(CurseForgeClient curseForgeClient, ModrinthClient modrinthClient) {
        this.curseForgeClient = curseForgeClient;
        this.modrinthClient = modrinthClient;
    }

    public List<ModrinthFile> resolveToModrinthFiles(ManifestMod manifestMod, ManifestInfo manifestInfo) {
        if (manifestMod == null) return List.of();
        if (manifestInfo == null) return List.of();

        String key = manifestMod.getProjectId() + ":" + manifestMod.getFileId();
        return indexFilesCache.computeIfAbsent(key, k -> resolveUncached(manifestMod, manifestInfo));
    }

    private List<ModrinthFile> resolveUncached(ManifestMod manifestMod, ManifestInfo manifestInfo) {
        try {
            // 1) CurseForge file endpoints (used only for matching/searching)
            CurseForgeModFileResponseDto modFile =
                    curseForgeClient.getModFile(manifestMod.getProjectId(), manifestMod.getFileId());
            if (modFile == null) return List.of();

            // Keep the call (already present in the architecture), but we must NOT use these URLs
            // for modrinth.index.json downloads/hashes. We will use modrinth.version.files[].url/hashes instead.
            CurseForgeDownloadUrlResponseDto downloadUrl =
                    curseForgeClient.getModFileDownloadUrl(manifestMod.getProjectId(), manifestMod.getFileId());

            String curseQuery = firstNonBlank(modFile.getDisplayName(), modFile.getFileName());
            if (curseQuery == null) curseQuery = String.valueOf(manifestMod.getProjectId());

            // 2) Modrinth project find (GET /v2/search?query=...)
            Map<String, String> searchParams = new HashMap<>();
            searchParams.put("query", curseQuery);

            JsonNode search = modrinthClient.search(searchParams);
            JsonNode hits = search != null ? search.get("hits") : null;
            if (hits == null || !hits.isArray() || hits.size() == 0) {
                logger.warn("No Modrinth search hits for curseforge projectId={} fileId={}",
                        manifestMod.getProjectId(), manifestMod.getFileId());
                return List.of();
            }

            // Pick first hit with project_id
            String targetProjectId = null;
            for (JsonNode hit : hits) {
                JsonNode idNode = hit.get("project_id");
                if (idNode != null && idNode.isTextual()) {
                    targetProjectId = idNode.asText();
                    break;
                }
            }
            if (targetProjectId == null || targetProjectId.isBlank()) return List.of();

            // 3) Modrinth project versions list (GET /v2/project/{project_id}/version)
            List<ModrinthVersionResponseDto> versions = modrinthClient.getProjectVersions(targetProjectId);
            if (versions == null || versions.isEmpty()) return List.of();

            // 4) Filter by manifest minecraftVersion + loader
            String minecraftConstraint = manifestInfo.getMinecraftVersion();
            String loaderConstraint = mapLoaderToModrinthLoader(manifestInfo.getLoader());

            ModrinthVersionResponseDto best = null;
            for (ModrinthVersionResponseDto v : versions) {
                if (v == null) continue;

                boolean minecraftOk =
                        minecraftConstraint == null || minecraftConstraint.isBlank() ||
                                (v.getGame_versions() != null &&
                                        v.getGame_versions().stream()
                                                .anyMatch(g -> g != null && g.contains(minecraftConstraint)));

                boolean loaderOk =
                        loaderConstraint == null || loaderConstraint.isBlank() ||
                                (v.getLoaders() != null &&
                                        v.getLoaders().stream()
                                                .anyMatch(l -> l != null && l.equalsIgnoreCase(loaderConstraint)));

                if (minecraftOk && loaderOk) {
                    best = v;
                    break;
                }
            }

            // fallback: first version that actually has files
            if (best == null) {
                for (ModrinthVersionResponseDto v : versions) {
                    if (v != null && v.getFiles() != null && !v.getFiles().isEmpty()) {
                        best = v;
                        break;
                    }
                }
            }
            if (best == null && !versions.isEmpty()) best = versions.get(0);

            if (best == null || best.getFiles() == null || best.getFiles().isEmpty()) return List.of();

            // 5) Build modrinth.index.json.files[] entries from Version response
            List<ModrinthFile> out = new ArrayList<>();
            for (ModrinthVersionResponseDto.ModrinthFileDto file : best.getFiles()) {
                if (file == null) continue;

                Map<String, String> hashesMap = file.getHashes();
                String sha1 = hashesMap != null ? hashesMap.get("sha1") : null;
                String sha512 = hashesMap != null ? hashesMap.get("sha512") : null;

                // Must keep hashes + downloads coming from the SAME modrinth file entry.
                String url = file.getUrl();
                if (url == null || url.isBlank()) continue;

                // require both hashes to keep output valid for modrinth schema/launcher
                if (sha1 == null || sha512 == null) continue;

                ModrinthFile mf = new ModrinthFile();
                mf.setPath(file.getFilename());

                // downloads must be an array of Modrinth download URLs
                mf.setDownloads(List.of(url));

                mf.setFileSize(file.getSize());

                ModrinthHashes hashes = new ModrinthHashes();
                hashes.setSha1(sha1);
                hashes.setSha512(sha512);
                mf.setHashes(hashes);

                // env: keep existing behavior (not changed here)
                mf.setEnv(Map.of("type", "required"));

                out.add(mf);
            }

            return out;
        } catch (Exception e) {
            logger.warn("CurseForge -> Modrinth resolution failed for projectId/fileId={}/{}",
                    manifestMod.getProjectId(), manifestMod.getFileId(), e);
            return List.of();
        }
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    private String mapLoaderToModrinthLoader(String loader) {
        if (loader == null) return null;
        String lower = loader.toLowerCase();
        if (lower.contains("fabric")) return "fabric";
        if (lower.contains("forge")) return "forge";
        if (lower.contains("neoforge")) return "neoforge";
        if (lower.contains("quilt")) return "quilt";
        return null;
    }
}