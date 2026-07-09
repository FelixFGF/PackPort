import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Download, ArrowLeft, RotateCcw, PackageCheck } from "lucide-react";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";
import { PrimaryButton } from "../components/PrimaryButton";

const API_BASE = "http://localhost:8081";

function toApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

function parseFilenameFromContentDisposition(
  contentDisposition: string | null
) {
  if (!contentDisposition) return null;

  // Handles: attachment; filename="foo.zip"
  // and: attachment; filename=foo.zip
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(
    contentDisposition
  );
  return match?.[1] ?? null;
}

export function FinishedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { profile, resetFlow, setStep, jobId } = usePackBridgeFlow();

  const {
    status,
    detectedMods,
    unsupportedMods,
    warnings,
    error,
    manifestInfo,
    modpackType,
    outputFileName,
  } = useJobStatus(jobId);

  const [isDownloading, setIsDownloading] = useState(false);

  // TEMP DEBUG: explicitly log mount/inputs for investigating placeholder/manifest loss.
  useEffect(() => {
    console.log("[FinishedPage] mount", {
      jobId,
      manifestInfo,
      location,
    });
  }, [jobId, manifestInfo, location]);

  const fileName = useMemo(() => {
    // UI fallback only. The actual download uses Content-Disposition filename (if present).
    // Never hardcode a static filename.
    if (status === "DONE") return outputFileName ?? "PackBridge_Output";
    return "PackBridge_Output";
  }, [status, outputFileName]);

  const canDownload = Boolean(jobId) && status === "DONE" && !error;

  const download = async () => {
    if (!jobId) return;

    try {
      setIsDownloading(true);

      const res = await fetch(
        toApiUrl(`/api/download/${encodeURIComponent(jobId)}`),
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Download failed (${res.status}). ${text}`.trim());
      }

      // DEBUG: verify whether the browser can read Content-Disposition.
      const contentDispositionHeader = res.headers.get(
        "Content-Disposition"
      );
      console.log("Content-Disposition:", contentDispositionHeader);

      const parsedHeaderName = parseFilenameFromContentDisposition(
        contentDispositionHeader
      );
      const backendFileName =
        parsedHeaderName ?? outputFileName ?? fileName;

      // TEMP DEBUG: only requested extra logging (backend filename via Content-Disposition)
      console.log("[FinishedPage] backend download filename:", backendFileName);

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = backendFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Minimal UX: rely on existing StepLayout locking; show error text in UI.
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const totalMods =
    typeof manifestInfo?.totalMods === "number"
      ? manifestInfo.totalMods
      : undefined;

  const packName =
    manifestInfo?.packName && manifestInfo.packName.trim()
      ? manifestInfo.packName
      : undefined;

  const minecraftVersion =
    manifestInfo?.minecraftVersion && manifestInfo.minecraftVersion.trim()
      ? manifestInfo.minecraftVersion
      : undefined;

  const loader =
    manifestInfo?.loader && manifestInfo.loader.trim()
      ? manifestInfo.loader
      : undefined;

  const author =
    manifestInfo?.author && manifestInfo.author.trim()
      ? manifestInfo.author
      : undefined;

  console.log("FinishedPage manifestInfo", manifestInfo);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-white/10">
                <PackageCheck className="h-4 w-4 text-indigo-200" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-50">
                Conversion finished
              </h1>
            </div>

            <p className="mt-2 text-sm text-zinc-300">
              Your converted profile bundle is ready to download.
            </p>

            {/* Required backend-only manifest information */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Pack info
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="text-sm text-zinc-200">
                  <span className="text-zinc-400">Pack name: </span>
                  <span className="text-zinc-50">{packName ?? ""}</span>
                </div>

                <div className="text-sm text-zinc-200">
                  <span className="text-zinc-400">Minecraft version: </span>
                  <span className="text-zinc-50">{minecraftVersion ?? ""}</span>
                </div>

                <div className="text-sm text-zinc-200">
                  <span className="text-zinc-400">Loader: </span>
                  <span className="text-zinc-50">{loader ?? ""}</span>
                </div>

                <div className="text-sm text-zinc-200">
                  <span className="text-zinc-400">Author: </span>
                  <span className="text-zinc-50">{author ?? ""}</span>
                </div>

                <div className="text-sm text-zinc-200">
                  <span className="text-zinc-400">Total mods: </span>
                  <span className="text-zinc-50">
                    {typeof totalMods === "number" ? totalMods : ""}
                  </span>
                </div>

                <div className="text-sm text-zinc-200">
                  <span className="text-zinc-400">Modpack type: </span>
                  <span className="text-zinc-50">
                    {modpackType && String(modpackType).trim()
                      ? String(modpackType)
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Detected mods
                </div>
                <div className="mt-2 text-xs text-zinc-300">
                  {detectedMods?.length ? detectedMods.join(", ") : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Warnings
                </div>
                <div className="mt-2 text-xs text-zinc-300">
                  {warnings?.length ? warnings.join(" • ") : "None"}
                </div>
              </div>
            </div>

            {unsupportedMods?.length ? (
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                  Unsupported mods ({unsupportedMods.length})
                </div>
                <div className="mt-2 text-xs text-amber-100">
                  {unsupportedMods.join(", ")}
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-red-200">
                  Error
                </div>
                <div className="mt-2 text-red-100">{error}</div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Download
            </div>
            <div className="mt-2 text-sm font-semibold text-zinc-50">
              {fileName}
            </div>
            <div className="mt-2 text-xs text-zinc-300">
              {canDownload
                ? "Ready"
                : status === "DONE"
                  ? "Not available"
                  : "Generating output…"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-semibold text-zinc-50">
              Download converted bundle
            </div>
            <div className="mt-2 text-sm text-zinc-300">
              Downloads the generated output from the backend.
            </div>

            <div className="mt-4">
              {canDownload ? (
                <button
                  type="button"
                  onClick={download}
                  disabled={isDownloading}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-white/7 disabled:opacity-60"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? "Downloading…" : "Download output"}
                </button>
              ) : (
                <PrimaryButton disabled className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate output
                </PrimaryButton>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-semibold text-zinc-50">
              Start a new conversion
            </div>
            <div className="mt-2 text-sm text-zinc-300">
              Reset the wizard state and upload a new profile bundle.
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  resetFlow();
                  setStep("welcome");
                  navigate("/");
                }}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-white/7"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New conversion
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate("/convert");
                }}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-white/7"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Keep existing profile section intact (not required by goal, but preserves UI) */}
        {profile ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Profile
            </div>
            <div className="mt-2 text-sm font-semibold text-zinc-50">
              {profile.profileName}
            </div>
            <div className="mt-1 text-xs text-zinc-300">
              {profile.sourcePlatform} → {profile.targetPlatform ?? "—"} •{" "}
              {profile.minecraftVersion}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}