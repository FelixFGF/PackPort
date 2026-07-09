import type { Loader, PackBridgeProfile, Platform, UnsupportedMod, UnsupportedModAction } from "../types/packbridge";

export function createMockConversionBundle(): {
  profile: PackBridgeProfile;
} {
  const profile: PackBridgeProfile = {
    profileName: "LogeshCraft",
    profileIconUrl: undefined,

    sourcePlatform: "CURSEFORGE",
    targetPlatform: "MODRINTH",

    minecraftVersion: "1.20.1",
    loader: "NEOFORGE",
    loaderVersion: "20.4.78",

    modCount: 128,
    resourcePacks: 3,
    shaderPacks: 2,

    worlds: 5,
    config: 7,
    servers: 2,
    screenshots: 14,
  };

  return { profile };
}

function pickRecommendedAction(sourcePlatform: Platform, targetPlatform: Platform): UnsupportedModAction {
  if (sourcePlatform !== targetPlatform) return "IMPORT_JAR";
  return "SKIP_MOD";
}

export function createMockUnsupportedMods(sourcePlatform: Platform, targetPlatform: Platform): UnsupportedMod[] {
  const baseMods = [
    { modId: "quark-extended", name: "Quark Extensions" },
    { modId: "worldedit-fabric", name: "WorldEdit (Fabric build)" },
    { modId: "journeymap-neoforge", name: "JourneyMap (NeoForge build)" },
    { modId: "extra-structures", name: "Extra Structures" },
    { modId: "rpg-rebalance", name: "RPG Rebalance Suite" },
    { modId: "client-shaders", name: "Client Shader Pack Utility" },
  ];

  return baseMods.map((m, idx) => {
    const recommendedAction = pickRecommendedAction(sourcePlatform, targetPlatform);
    return {
      modId: `${m.modId}-${idx}`,
      name: m.name,
      sourcePlatform,
      targetPlatform,
      recommendedAction,
      description: "This mod is not present on one platform. Use the recommended action to preserve gameplay as much as possible.",
    };
  });
}

export function createMockDownloadUrl(downloadName: string): string {
  // Mock: create a small blob and return an object URL for downloading.
  const content = [
    "PackBridge mock output\n",
    "=================================\n",
    `Download: ${downloadName}\n`,
    "This is a mock file created by the frontend demo.\n",
  ].join("");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  return URL.createObjectURL(blob);
}