package com.packbridge.service.modrinth;

import com.fasterxml.jackson.databind.JsonNode;
import com.packbridge.client.curseforge.CurseForgeClient;
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
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class CurseForgeModResolutionService {

    private static final Logger logger = LoggerFactory.getLogger(CurseForgeModResolutionService.class);

    private final CurseForgeClient curseForgeClient;
    private final ModrinthClient modrinthClient;

    public CurseForgeModResolutionService(CurseForgeClient curseForgeClient, ModrinthClient modrinthClient) {
        this.curseForgeClient = curseForgeClient;
        this.modrinthClient = modrinthClient;
    }

    public List<ModrinthFile> resolveToModrinthFiles(ManifestMod manifestMod, ManifestInfo manifestInfo) {
        // Per-conversion in-memory caches (no globals):
        final Map<String, CurseForgeModFileResponseDto> curseforgeMetaCache = new HashMap<>();
        final Map<String, JsonNode> modrinthSearchCache = new HashMap<>();
        final Map<String, List<ModrinthVersionResponseDto>> modrinthVersionsCache = new HashMap<>();

        if (manifestMod == null || manifestInfo == null) return List.of();

        try {
            // CurseForge metadata used for matching/search queries
            String curseKey = manifestMod.getProjectId() + ":" + manifestMod.getFileId();
            CurseForgeModFileResponseDto curseFile = curseforgeMetaCache.computeIfAbsent(
                    curseKey,
                    k -> safeGetCurseForgeModFile(manifestMod)
            );

            if (curseFile == null) {
                return List.of(buildMissingModFile(manifestMod, "curseforge_modfile_not_found", "CurseForge mod file metadata missing"));
            }

            // Resolution chain:
            // 1) CurseForge slug (best-effort derived from displayName/fileName)
            // 2) exact project name (best-effort: displayName then fileName)
            // 3) case-insensitive project name
            // 4) best-effort fallback
            String displayName = trimToNull(curseFile.getDisplayName());
            String fileName = trimToNull(curseFile.getFileName());

            String slugCandidate = deriveSlugCandidate(displayName, fileName);

            String exactNameCandidate = firstNonBlank(displayName, fileName);
            String fallbackNumericCandidate = manifestMod.getProjectId() > 0 ? String.valueOf(manifestMod.getProjectId()) : null;

            List<String> candidateQueries = new ArrayList<>();
            if (slugCandidate != null) candidateQueries.add(slugCandidate); // slug first
            if (exactNameCandidate != null) candidateQueries.add(exactNameCandidate); // exact name
            if (exactNameCandidate != null) candidateQueries.add(exactNameCandidate); // case-insensitive match in logic
            if (fallbackNumericCandidate != null) candidateQueries.add(fallbackNumericCandidate); // best-effort fallback

            String resolvedModrinthProjectId = null;
            for (String q : candidateQueries) {
                if (q == null || q.isBlank()) continue;

                JsonNode search = safeSearchModrinthProjects(q, modrinthSearchCache);
                String projectId = pickBestProjectIdFromSearch(search, q);
                if (projectId != null) {
                    resolvedModrinthProjectId = projectId;
                    break;
                }
            }

            if (resolvedModrinthProjectId == null) {
                return List.of(buildMissingModFile(manifestMod, "modrinth_project_not_found", "No Modrinth project matched the CurseForge mod"));
            }

            List<ModrinthVersionResponseDto> versions = modrinthVersionsCache.computeIfAbsent(
                    resolvedModrinthProjectId,
                    this::safeGetProjectVersions
            );

            if (versions == null || versions.isEmpty()) {
                return List.of(buildMissingModFile(manifestMod, "modrinth_versions_empty", "No Modrinth versions returned for resolved project"));
            }

            String minecraftConstraint = trimToNull(manifestInfo.getMinecraftVersion());
            String loaderConstraint = mapLoaderToModrinthLoader(manifestInfo.getLoader());

            ModrinthVersionResponseDto best = selectBestVersion(versions, minecraftConstraint, loaderConstraint);

            if (best == null || best.getFiles() == null || best.getFiles().isEmpty()) {
                return List.of(buildMissingModFile(manifestMod, "modrinth_version_not_resolved", "No compatible Modrinth version with files found"));
            }

            List<ModrinthFile> resolvedFiles = buildModrinthFilesFromVersion(best, manifestMod);
            if (resolvedFiles.isEmpty()) {
                return List.of(buildMissingModFile(manifestMod, "modrinth_files_invalid", "Compatible Modrinth version found but produced no valid Modrinth files"));
            }

            return resolvedFiles;

        } catch (Exception e) {
            logger.warn("CurseForge -> Modrinth resolution failed for projectId/fileId={}/{}",
                    manifestMod.getProjectId(), manifestMod.getFileId(), e);

            return List.of(buildMissingModFile(
                    manifestMod,
                    "resolver_exception",
                    "Exception during resolution: " + e.getClass().getSimpleName()
            ));
        }
    }

    private CurseForgeModFileResponseDto safeGetCurseForgeModFile(ManifestMod manifestMod) {
        try {
            return curseForgeClient.getModFile(manifestMod.getProjectId(), manifestMod.getFileId());
        } catch (Exception e) {
            logger.warn("CurseForge mod file fetch failed for projectId/fileId={}/{}",
                    manifestMod.getProjectId(), manifestMod.getFileId(), e);
            return null;
        }
    }

    private List<ModrinthVersionResponseDto> safeGetProjectVersions(String modrinthProjectId) {
        try {
            return modrinthClient.getProjectVersions(modrinthProjectId);
        } catch (Exception e) {
            logger.warn("Modrinth versions fetch failed for project_id={}", modrinthProjectId, e);
            return List.of();
        }
    }

    private JsonNode safeSearchModrinthProjects(String query, Map<String, JsonNode> modrinthSearchCache) {
        try {
            String key = query.toLowerCase(Locale.ROOT);
            JsonNode cached = modrinthSearchCache.get(key);
            if (cached != null) return cached;

            Map<String, String> params = new HashMap<>();
            params.put("query", query);

            JsonNode res = modrinthClient.search(params);
            modrinthSearchCache.put(key, res);
            return res;
        } catch (Exception e) {
            logger.warn("Modrinth search failed for query={}", query, e);
            return null;
        }
    }

    private String pickBestProjectIdFromSearch(JsonNode searchResponse, String originalQuery) {
        if (searchResponse == null) return null;

        JsonNode hits = searchResponse.get("hits");
        if (hits == null || !hits.isArray() || hits.isEmpty()) return null;

        String queryTrim = trimToNull(originalQuery);
        String queryLower = queryTrim != null ? queryTrim.toLowerCase(Locale.ROOT) : null;

        // Exact match attempt
        if (queryTrim != null) {
            for (JsonNode hit : hits) {
                if (hit == null) continue;

                String projectId = textOrNull(hit.get("project_id"));
                if (projectId == null) continue;

                String title = textOrNull(hit.get("title"));
                String projectName = textOrNull(hit.get("project_name"));
                String slug = textOrNull(hit.get("slug"));

                if (equalsExact(queryTrim, title) || equalsExact(queryTrim, projectName) || equalsExact(queryTrim, slug)) {
                    return projectId;
                }
            }
        }

        // Case-insensitive match attempt
        if (queryLower != null) {
            for (JsonNode hit : hits) {
                if (hit == null) continue;

                String projectId = textOrNull(hit.get("project_id"));
                if (projectId == null) continue;

                String title = textOrNull(hit.get("title"));
                String projectName = textOrNull(hit.get("project_name"));
                String slug = textOrNull(hit.get("slug"));

                if (equalsCaseInsensitive(queryLower, title)
                        || equalsCaseInsensitive(queryLower, projectName)
                        || equalsCaseInsensitive(queryLower, slug)) {
                    return projectId;
                }
            }
        }

        // Best-effort fallback: first hit with project_id
        for (JsonNode hit : hits) {
            if (hit == null) continue;

            String projectId = textOrNull(hit.get("project_id"));
            if (projectId != null && !projectId.isBlank()) return projectId;
        }

        return null;
    }

    private ModrinthVersionResponseDto selectBestVersion(
            List<ModrinthVersionResponseDto> versions,
            String minecraftConstraint,
            String loaderConstraint
    ) {
        if (versions == null || versions.isEmpty()) return null;

        List<ModrinthVersionResponseDto> candidates = new ArrayList<>();
        for (ModrinthVersionResponseDto v : versions) {
            if (v == null) continue;
            if (v.getFiles() == null || v.getFiles().isEmpty()) continue;

            boolean minecraftOk = true;
            if (minecraftConstraint != null && !minecraftConstraint.isBlank()) {
                minecraftOk = v.getGame_versions() != null && v.getGame_versions().stream()
                        .anyMatch(g -> g != null && g.contains(minecraftConstraint));
            }

            boolean loaderOk = true;
            if (loaderConstraint != null && !loaderConstraint.isBlank()) {
                loaderOk = v.getLoaders() != null && v.getLoaders().stream()
                        .anyMatch(l -> l != null && l.equalsIgnoreCase(loaderConstraint));
            }

            if (minecraftOk && loaderOk) candidates.add(v);
        }

        if (candidates.isEmpty()) {
            // Best-effort fallback: any version with files
            for (ModrinthVersionResponseDto v : versions) {
                if (v != null && v.getFiles() != null && !v.getFiles().isEmpty()) return v;
            }
            return null;
        }

        // Prefer stable releases where possible (heuristic)
        candidates.sort(
                Comparator
                        .comparingInt((ModrinthVersionResponseDto v) -> stabilityScore(v.getVersion_number()))
                        .reversed()
                        .thenComparingInt(v -> v.getFiles() != null ? v.getFiles().size() : 0)
                        .reversed()
        );

        return candidates.get(0);
    }

    private int stabilityScore(String versionNumber) {
        if (versionNumber == null) return 0;

        String s = versionNumber.toLowerCase(Locale.ROOT);
        if (s.contains("beta") || s.contains("alpha") || s.contains("snapshot") || s.contains("rc")) return 0;
        if (s.matches("^\\d+(\\.\\d+){0,3}(-.*)?$")) return 10;

        return 5;
    }

    private List<ModrinthFile> buildModrinthFilesFromVersion(ModrinthVersionResponseDto best, ManifestMod manifestMod) {
        List<ModrinthFile> out = new ArrayList<>();

        for (ModrinthVersionResponseDto.ModrinthFileDto file : best.getFiles()) {
            if (file == null) continue;

            String url = trimToNull(file.getUrl());
            String filename = trimToNull(file.getFilename());

            Map<String, String> hashesMap = file.getHashes();
            String sha1 = hashesMap != null ? trimToNull(hashesMap.get("sha1")) : null;
            String sha512 = hashesMap != null ? trimToNull(hashesMap.get("sha512")) : null;

            if (url == null || url.isBlank()) continue;
            if (filename == null || filename.isBlank()) continue;
            if (sha1 == null || sha1.isBlank()) continue;
            if (sha512 == null || sha512.isBlank()) continue;

            ModrinthFile mf = new ModrinthFile();
            mf.setPath(filename);
            mf.setDownloads(List.of(url));
            mf.setFileSize(file.getSize());

            ModrinthHashes hashes = new ModrinthHashes();
            hashes.setSha1(sha1);
            hashes.setSha512(sha512);
            mf.setHashes(hashes);

            // Requirement: env.client="required" and env.server="required"
            mf.setEnv(Map.of(
                    "client", "required",
                    "server", "required"
            ));

            out.add(mf);
        }

        return out;
    }

    private ModrinthFile buildMissingModFile(ManifestMod manifestMod, String reasonCode, String reasonMessage) {
        // Structured missing-mod result encoded into returned ModrinthFile env map
        Map<String, Object> missingMod = Map.of(
                "curseForgeProjectId", manifestMod.getProjectId(),
                "curseForgeFileId", manifestMod.getFileId(),
                "required", manifestMod.isRequired(),
                "reasonCode", reasonCode,
                "reasonMessage", reasonMessage
        );

        return new ModrinthFile() {{
            setPath("missing:" + manifestMod.getProjectId() + ":" + manifestMod.getFileId());
            setDownloads(List.of());
            setFileSize(0);
            setHashes(null);
            setEnv(Map.of(
                    "client", "required",
                    "server", "required",
                    "missingMod", missingMod
            ));
        }};
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String deriveSlugCandidate(String displayName, String fileName) {
        String base = firstNonBlank(displayName, fileName);
        if (base == null) return null;

        String slug = base.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");

        return slug.isBlank() ? null : slug;
    }

    private static String textOrNull(JsonNode node) {
        if (node == null) return null;
        if (node.isTextual()) return node.asText();
        return null;
    }

    private static boolean equalsExact(String a, String b) {
        if (a == null || b == null) return false;
        return a.equals(b);
    }

    private static boolean equalsCaseInsensitive(String lowerA, String b) {
        if (lowerA == null || b == null) return false;
        return lowerA.equals(b.toLowerCase(Locale.ROOT));
    }

    private String mapLoaderToModrinthLoader(String loader) {
        if (loader == null) return null;

        String lower = loader.toLowerCase(Locale.ROOT);
        if (lower.contains("fabric")) return "fabric";
        if (lower.contains("forge")) return "forge";
        if (lower.contains("neoforge")) return "neoforge";
        if (lower.contains("quilt")) return "quilt";
        return null;
    }
}