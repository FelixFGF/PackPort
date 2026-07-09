package com.packbridge.service;

import com.packbridge.model.CompatibilityLoaderType;
import com.packbridge.model.CompatibilityResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompatibilityService {

    public EvaluationResult evaluate(List<String> detectedMods) {
        List<String> safeMods = detectedMods == null ? List.of() : detectedMods;

        Map<String, CompatibilityLoaderType> modToLoader = new HashMap<>();
        int fabricCount = 0;
        int forgeCount = 0;

        for (String mod : safeMods) {
            CompatibilityLoaderType loader = inferLoader(mod);
            modToLoader.put(mod, loader);
            if (loader == CompatibilityLoaderType.FABRIC) fabricCount++;
            if (loader == CompatibilityLoaderType.FORGE) forgeCount++;
        }

        CompatibilityLoaderType primaryLoader = inferPrimaryLoader(fabricCount, forgeCount);

        List<CompatibilityResult> compatibilityResults = new ArrayList<>();
        List<String> unsupportedMods = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        boolean hasFabric = fabricCount > 0;
        boolean hasForge = forgeCount > 0;
        if (hasFabric && hasForge && primaryLoader != null) {
            warnings.add("Mixed loader mods detected (FABRIC + FORGE). Using primary loader: " + primaryLoader);
        }

        for (String mod : safeMods) {
            CompatibilityLoaderType inferred = modToLoader.getOrDefault(mod, CompatibilityLoaderType.UNKNOWN);

            if (primaryLoader != null && inferred != CompatibilityLoaderType.UNKNOWN && inferred != primaryLoader) {
                unsupportedMods.add(mod);
                compatibilityResults.add(new CompatibilityResult(mod, inferred, "Incompatible with primary loader: " + primaryLoader));
            } else if (inferred == CompatibilityLoaderType.UNKNOWN) {
                warnings.add("Unknown loader for mod: " + mod);
                compatibilityResults.add(new CompatibilityResult(mod, CompatibilityLoaderType.UNKNOWN, "Unknown loader (heuristic)"));
            } else {
                compatibilityResults.add(new CompatibilityResult(mod, inferred, null));
            }
        }

        return new EvaluationResult(unsupportedMods, warnings, compatibilityResults);
    }

    private CompatibilityLoaderType inferPrimaryLoader(int fabricCount, int forgeCount) {
        if (fabricCount == 0 && forgeCount == 0) return CompatibilityLoaderType.UNKNOWN;
        if (fabricCount >= forgeCount) return CompatibilityLoaderType.FABRIC;
        return CompatibilityLoaderType.FORGE;
    }

    private CompatibilityLoaderType inferLoader(String modName) {
        if (modName == null) return CompatibilityLoaderType.UNKNOWN;
        String n = modName.toLowerCase();

        if (n.contains("fabric")) return CompatibilityLoaderType.FABRIC;
        if (n.contains("forge")) return CompatibilityLoaderType.FORGE;

        return CompatibilityLoaderType.UNKNOWN;
    }

    public static class EvaluationResult {
        private List<String> unsupportedMods;
        private List<String> warnings;
        private List<CompatibilityResult> compatibilityResults;

        public EvaluationResult() {}

        public EvaluationResult(List<String> unsupportedMods, List<String> warnings, List<CompatibilityResult> compatibilityResults) {
            this.unsupportedMods = unsupportedMods;
            this.warnings = warnings;
            this.compatibilityResults = compatibilityResults;
        }

        public List<String> getUnsupportedMods() {
            return unsupportedMods;
        }

        public void setUnsupportedMods(List<String> unsupportedMods) {
            this.unsupportedMods = unsupportedMods;
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public void setWarnings(List<String> warnings) {
            this.warnings = warnings;
        }

        public List<CompatibilityResult> getCompatibilityResults() {
            return compatibilityResults;
        }

        public void setCompatibilityResults(List<CompatibilityResult> compatibilityResults) {
            this.compatibilityResults = compatibilityResults;
        }
    }
}