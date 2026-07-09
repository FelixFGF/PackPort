import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Boxes, Sparkles, AlertTriangle, FileText } from "lucide-react";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";
import { PrimaryButton } from "../components/PrimaryButton";
import LogPanel from "../components/LogPanel";

export function ScanResultPage() {
  const navigate = useNavigate();
  const { setStep, jobId } = usePackBridgeFlow();

  const {
    status,
    detectedMods,
    compatibilityResults,
    warnings,
    unsupportedMods,
    error,
    logs,
    logEntries,
  } = useJobStatus(jobId);

  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);

  const isScanning =
    status === "SCANNING" || status === "RUNNING" || status === "SCANNING_MODS";

  const detectedPreview = useMemo(() => {
    if (!detectedMods?.length) return "—";
    return detectedMods.slice(0, 10).join(", ") + (detectedMods.length > 10 ? "…" : "");
  }, [detectedMods]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-200" />
              <h1 className="text-xl font-semibold text-zinc-50">Profile scanned</h1>
            </div>

            <p className="mt-2 text-sm text-zinc-300">
              {error
                ? "Scan failed. Please check the error details below."
                : isScanning
                  ? "Scanning mods from your uploaded bundle…"
                  : status === "DONE"
                    ? "Scan completed. Review detected mods and compatibility results."
                    : status === "FAILED"
                      ? "Scan failed."
                      : "Waiting for scan results from the backend…"}
            </p>

            {detectedMods?.length ? (
              <div className="mt-3 text-xs text-zinc-400">
                Detected:{" "}
                <span className="font-medium text-zinc-300">{detectedPreview}</span>
              </div>
            ) : null}
          </div>

          <div className="sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Job status
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">
              {status ?? "—"}
            </div>
            {unsupportedMods?.length ? (
              <div className="mt-1 text-xs text-amber-200">
                Unsupported mods: {unsupportedMods.length}
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-2 text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">Error</div>
                <div className="mt-1 text-sm">{error}</div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-indigo-200" />
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Detected mods
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-zinc-50">
                {detectedMods?.length ?? 0}
              </div>
              <div className="text-sm text-zinc-300">mods</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Compatibility results
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-zinc-50">
                {compatibilityResults?.length ?? 0}
              </div>
              <div className="text-sm text-zinc-300">entries</div>
            </div>

            {compatibilityResults?.length ? (
              <div className="mt-2 text-xs text-zinc-500">
                {status === "DONE" ? "Ready to continue." : "Loading results…"}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Warnings
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-zinc-50">{warnings?.length ?? 0}</div>
              <div className="text-sm text-zinc-300">items</div>
            </div>

            {warnings?.length ? (
              <ul className="mt-2 list-disc pl-4 text-xs text-zinc-500">
                {warnings.slice(0, 3).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
                {warnings.length > 3 ? <li>…</li> : null}
              </ul>
            ) : (
              <div className="mt-2 text-xs text-zinc-500">None</div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Next
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-50">
                Choose conversion target and resolve unsupported mods
              </div>
              <div className="mt-1 text-sm text-zinc-300">
                {isScanning
                  ? "Waiting for scan results from the backend."
                  : "Proceed to select target platform and handle any unsupported mods."}
              </div>
            </div>

            <div className="flex items-center justify-start sm:justify-end">
              {(logs?.length || logEntries?.length) ? (
                <PrimaryButton
                  variant="secondary"
                  onClick={() => setIsLogPanelOpen(true)}
                  className="w-full sm:w-auto mr-2"
                >
                  <FileText className="h-4 w-4" /> Logs
                </PrimaryButton>
              ) : null}

              <PrimaryButton
                disabled={isScanning || Boolean(error) || status === "FAILED"}
                onClick={() => {
                  if (unsupportedMods?.length) {
                    setStep("unsupported-mods");
                    navigate("/unsupported-mods");
                  } else {
                    setStep("target");
                    navigate("/target");
                  }
                }}
                className="w-full sm:w-auto"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      <LogPanel
        isOpen={isLogPanelOpen}
        onClose={() => setIsLogPanelOpen(false)}
        logs={logs ?? []}
        logEntries={logEntries ?? []}
      />
    </div>
  );
}