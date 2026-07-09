import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  CircleCheck,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";
import type { Platform, UnsupportedModAction, UnsupportedMod } from "../types/packbridge";
import { PrimaryButton } from "../components/PrimaryButton";

function getActionLabel(action: UnsupportedModAction) {
  switch (action) {
    case "IMPORT_JAR":
      return "Import original .jar";
    case "SKIP_MOD":
      return "Skip this mod";
  }
}

function platformLabel(p: Platform) {
  return p === "CURSEFORGE" ? "CurseForge" : "Modrinth";
}

function getDecisionButtonState(
  mod: UnsupportedMod,
  action: UnsupportedModAction
) {
  return mod.recommendedAction === action;
}

export function UnsupportedModsPage() {
  const navigate = useNavigate();
  const { setStep, jobId, setUnsupportedAction, targetPlatform, profile } =
    usePackBridgeFlow();

  const { unsupportedMods, error } = useJobStatus(jobId);

  const resolvedTarget: Platform | undefined =
    targetPlatform ?? profile?.targetPlatform;

  const counts = React.useMemo(() => {
    const total = unsupportedMods.length;
    const importCount = unsupportedMods.filter(
      (m) => m.recommendedAction === "IMPORT_JAR"
    ).length;
    return { total, importCount };
  }, [unsupportedMods]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-amber-200" />
              <h1 className="text-xl font-semibold text-zinc-50">
                Unsupported mods detected
              </h1>
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              Some mods exist only on one platform. Choose what to do before we
              start conversion.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Unmatched mods
            </div>
            <div className="mt-1 text-2xl font-bold text-zinc-50">{counts.total}</div>
            <div className="mt-1 text-xs text-zinc-300">
              Recommended imports: {counts.importCount}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-zinc-50">
                Conversion target:{" "}
                <span className="text-indigo-200">
                  {resolvedTarget ? platformLabel(resolvedTarget) : "—"}
                </span>
              </div>
              <div className="text-xs text-zinc-300">
                Decisions affect how unsupported mods are handled.
              </div>
            </div>
          </div>

          <div className="border-t border-white/10">
            {unsupportedMods.length === 0 ? (
              <div className="px-5 py-8 flex items-center gap-3 text-zinc-300">
                <CircleCheck className="h-5 w-5 text-emerald-200" />
                No unsupported mods. You can continue.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {unsupportedMods.map((mod) => (
                  <div key={mod.modId} className="px-5 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-50 truncate">
                          {mod.name}
                        </div>
                        <div className="mt-1 text-xs text-zinc-300">
                          Exists only on{" "}
                          <span className="text-indigo-200 font-semibold">
                            {platformLabel(mod.sourcePlatform)}
                          </span>{" "}
                          (target:{" "}
                          <span className="text-indigo-200 font-semibold">
                            {platformLabel(mod.targetPlatform)}
                          </span>
                          )
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:mr-2">
                          Decision
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setUnsupportedAction(mod.modId, "IMPORT_JAR")
                            }
                            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                              getDecisionButtonState(mod, "IMPORT_JAR")
                                ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200"
                                : "border-white/10 bg-white/5 text-zinc-100 hover:bg-white/7"
                            }`}
                          >
                            <Wrench className="inline-block h-4 w-4 mr-2 align-text-bottom" />
                            {getActionLabel("IMPORT_JAR")}
                          </button>

                          <button
                            type="button"
                            onClick={() => setUnsupportedAction(mod.modId, "SKIP_MOD")}
                            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                              getDecisionButtonState(mod, "SKIP_MOD")
                                ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200"
                                : "border-white/10 bg-white/5 text-zinc-100 hover:bg-white/7"
                            }`}
                          >
                            <TriangleAlert className="inline-block h-4 w-4 mr-2 align-text-bottom" />
                            {getActionLabel("SKIP_MOD")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setStep("target");
              navigate("/target");
            }}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-white/7"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>

          <PrimaryButton
            onClick={() => {
              setStep("convert");
              navigate("/convert");
            }}
          >
            Start conversion <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}