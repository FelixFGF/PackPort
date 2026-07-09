export type Platform = "CURSEFORGE" | "MODRINTH";

export type Loader = "FORGE" | "NEOFORGE" | "FABRIC" | "QUILT";

export type UnsupportedModAction = "IMPORT_JAR" | "SKIP_MOD";

export type UnsupportedMod = {
  modId: string;
  name: string;
  sourcePlatform: Platform;
  targetPlatform: Platform;
  recommendedAction: UnsupportedModAction;
  description?: string;
};

export type PackBridgeProfile = {
  profileName: string;
  profileIconUrl?: string;

  sourcePlatform: Platform;
  targetPlatform?: Platform;

  minecraftVersion: string;
  loader: Loader;
  loaderVersion: string;

  modCount: number;
  resourcePacks: number;
  shaderPacks: number;

  worlds: number;
  config: number;
  servers: number;
  screenshots: number;
};