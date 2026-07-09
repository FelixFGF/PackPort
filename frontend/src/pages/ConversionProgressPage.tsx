import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";
import { PrimaryButton } from "../components/PrimaryButton";

function statusToHeadline(status?: string) {
  switch (status) {
    case "SCANNING":
      return "Scanning modpack";
    case "CONVERTING":
      return "Converting profile";
    case "DONE":
      return "Conversion complete";
    case "FAILED":
      return "Conversion failed";
    default:
      return "Working…";
  }
}

function formatUnsupportedMod(m: unknown): string {
  if (typeof m === "string") return m;
  if (m && typeof m === "object") {
    const anyM = m as any;
    if (typeof anyM.name === "string") return anyM.name;
    if (typeof anyM.modId === "string") return anyM.modId;
  }
  return "Unsupported mod";
}

export function ConversionProgressPage() {
  const navigate = useNavigate();
  const { setStep, jobId } = usePackBridgeFlow();

  const { status, progress, detectedMods, warnings, unsupportedMods, error, isDone } =
    useJobStatus(jobId);

  const stages = useMemo(
    () => [
      "scan profile",
      "resolve loaders",
      "map mods",
      "map resource packs",
      "apply minecraft settings",
      "package output",
    ],
    []
  );

  // Map backend job status to a simple stage index (use status + progress only).
  const stageIndex = useMemo(() => {
    switch (status) {
      case "SCANNING":
        return 0;
      case "CONVERTING":
        return Math.min(5, Math.max(1, Math.floor((progress / 100) * 5)));
      case "DONE":
        return 5;
      case "FAILED":
        return 5;
      default:
        return 0;
    }
  }, [status, progress]);

  const primaryDisabled = !isDone || status === "FAILED";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-white/10">
                <CheckCircle2 className="h-4 w-4 text-indigo-200" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-50">{statusToHeadline(status)}</h1>
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              {error ? error : "Live updates from the backend job runner."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Progress
            </div>
            <div className="mt-1 text-3xl font-bold text-zinc-50">{Math.round(progress)}%</div>
            <div className="mt-1 text-xs text-zinc-300">
              Status: <span className="font-medium">{status ?? "CREATED"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="flex flex-col gap-4">
            {stages.map((s, idx) => {
              const isActive = idx === stageIndex;
              const isComplete = idx < stageIndex || (isDone && idx <= stageIndex);

              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <div
                      className={`absolute inset-0 rounded-2xl ring-1 ${
                        isComplete
                          ? "bg-emerald-500/20 ring-emerald-400/40"
                          : isActive
                            ? "bg-indigo-500/20 ring-indigo-400/40"
                            : "bg-white/5 ring-white/10"
                      }`}
                    />
                    <div className="relative text-xs font-bold text-zinc-50">
                      {isComplete ? (
                        <span className="text-emerald-200">✓</span>
                      ) : isActive ? (
                        <span className="text-indigo-200">•</span>
                      ) : (
                        <span className="text-zinc-500"> </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        isActive ? "text-zinc-50" : "text-zinc-300"
                      }`}
                    >
                      {s}
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${
                          isComplete
                            ? "bg-emerald-400/60"
                            : isActive
                              ? "bg-indigo-400/60"
                              : "bg-white/10"
                        }`}
                        style={{
                          width: `${
                            isActive ? Math.round(progress) : isComplete ? 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {(detectedMods?.length ?? 0) > 0 ? (
              <div className="mt-2 text-xs text-zinc-300">
                Detected mods:{" "}
                <span className="font-medium">
                  {(detectedMods ?? [])
                    .slice(0, 6)
                    .map((d) => (typeof d === "string" ? d : String(d)))
                    .join(", ")}
                  {(detectedMods ?? []).length > 6 ? "…" : ""}
                </span>
              </div>
            ) : null}

            {(warnings?.length ?? 0) > 0 ? (
              <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                <div className="font-semibold mb-1">Warnings</div>
                <ul className="list-disc ml-5">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(unsupportedMods?.length ?? 0) > 0 ? (
              <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                <div className="font-semibold mb-1">Unsupported mods</div>
                <ul className="list-disc ml-5">
                  {(unsupportedMods ?? []).slice(0, 6).map((m, i) => (
                    <li key={i}>{formatUnsupportedMod(m)}</li>
                  ))}
                  {(unsupportedMods ?? []).length > 6 ? <li>…</li> : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setStep("unsupported-mods");
              navigate("/unsupported-mods");
            }}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-white/7"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>

          <PrimaryButton
            disabled={primaryDisabled}
            onClick={() => {
              setStep("finished");
              navigate("/finished");
            }}
          >
            Continue to download <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}