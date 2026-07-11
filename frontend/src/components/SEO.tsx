import React from "react";
import { Helmet } from "react-helmet-async";

export type SeoPageConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  openGraph?: {
    image?: string;
    type?: string; // default: website
  };
};

const SITE_URL = "https://packport.netlify.app";
const SITE_NAME = "PackPort";

const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/og-image.png`;

const KEYWORDS =
  "PackPort, PackPort.netlify.app, Minecraft, Minecraft Modpack, CurseForge, Modrinth, Mod Converter, Modpack Converter, mrpack, CurseForge to Modrinth, Minecraft Tools, Modrinth Export, Modpack Export, Forge, Fabric, NeoForge, Quilt";

function normalizeCanonicalPath(path: string) {
  if (!path) return "/";
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export function SEO({ config }: { config: SeoPageConfig }) {
  const canonical = `${SITE_URL}${normalizeCanonicalPath(config.canonicalPath)}`;

  return (
    <Helmet>
      {/* Document Title */}
      <title>{config.title}</title>

      {/* Basic Meta */}
      <meta name="description" content={config.description} />
      <meta name="keywords" content={KEYWORDS} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:type" content={config.openGraph?.type ?? "website"} />
      <meta
        property="og:image"
        content={config.openGraph?.image ?? DEFAULT_OG_IMAGE}
      />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta
        name="twitter:image"
        content={config.openGraph?.image ?? DEFAULT_OG_IMAGE}
      />
    </Helmet>
  );
}