import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, GitBranch, Package } from "lucide-react";
import { PrimaryButton } from "../components/PrimaryButton";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";
import type { Platform } from "../types/packbridge";

function PlatformCard({
  title,
  subtitle,
  value,
  selected,
  onSelect,
  icon,
  disabled,
}: {
  title: string;
  subtitle: string;
  value: Platform;
  selected: boolean;
  onSelect: (v: Platform) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition ${
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/5 opacity-50"
          : selected
            ? "border-indigo-400/40 bg-gradient-to-b from-indigo-500/20 to-violet-500/10"
            : "border-white/10 bg-white/5 hover:bg-white/7"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-2xl p-2 transition ${
            selected ? "bg-indigo-500/20 text-indigo-200" : "bg-black/20 text-zinc-200"
          }`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <div className="text-base font-semibold text-zinc-50">{title}</div>
          <div className="mt-1 text-sm text-zinc-300">{subtitle}</div>
        </div>
      </div>

      <div className="mt-4 text-xs font-semibold uppercase tracking-wide">
        {disabled ? (
          <span className="text-zinc-500">Unavailable</span>
        ) : selected ? (
          <span className="text-indigo-200">Selected</span>
        ) : (
          <span className="text-zinc-500 group-hover:text-zinc-400">Click to select</span>
        )}
      </div>
    </button>
  );
}

export function TargetPlatformPage() {
  const navigate = useNavigate();
  const { profile, targetPlatform, setTargetPlatform, setStep, jobId } = usePackBridgeFlow();

  const { modpackType } = useJobStatus(jobId);

  const allChoices = useMemo(() => {
    return ["CURSEFORGE", "MODRINTH"] as Platform[];
  }, []);

  // Problem 1: SOURCE must reflect the detected upload source.
  // Use backend scan result (job polling). If backend didn't provide it, fall back to existing profile behavior.
  const sourcePlatform: Platform | undefined = useMemo(() => {
    if (modpackType === "CURSEFORGE") return "CURSEFORGE";
    if (modpackType === "MODRINTH") return "MODRINTH";
    return profile?.sourcePlatform;
  }, [modpackType, profile?.sourcePlatform]);

  const target: Platform = useMemo(() => {
    if (sourcePlatform === "CURSEFORGE") return "MODRINTH";
    if (sourcePlatform === "MODRINTH") return "CURSEFORGE";

    if (targetPlatform) return targetPlatform;
    return "MODRINTH";
  }, [sourcePlatform, targetPlatform]);

  // Problem 2: lock the forbidden target card and ensure it is visible as disabled.
  const forbiddenTarget: Platform | undefined = useMemo(() => {
    if (sourcePlatform === "CURSEFORGE") return "CURSEFORGE";
    if (sourcePlatform === "MODRINTH") return "MODRINTH";
    return undefined;
  }, [sourcePlatform]);

  const sourceLabel =
    sourcePlatform === "CURSEFORGE"
      ? "CurseForge"
      : sourcePlatform === "MODRINTH"
        ? "Modrinth"
        : "—";

  const targetLabel = target === "CURSEFORGE" ? "CurseForge" : "Modrinth";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-200" />
              <h1 className="text-xl font-semibold text-zinc-50">Choose target platform</h1>
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              We’ll convert your profile and keep as much information as possible.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Source</div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">{sourceLabel}</div>

            <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Target</div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">{targetLabel}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {allChoices.map((p) => {
            const disabled = forbiddenTarget !== undefined && p === forbiddenTarget;
            const selected = target === p;

            return (
              <PlatformCard
                key={p}
                title={p === "CURSEFORGE" ? "CurseForge" : "Modrinth"}
                subtitle={p === "CURSEFORGE" ? "Import to CurseForge format" : "Import to Modrinth format"}
                value={p}
                selected={selected}
                disabled={disabled}
                onSelect={(v) => {
                  if (disabled) return;
                  setTargetPlatform(v);
                }}
                icon={p === "CURSEFORGE" ? <Globe className="h-5 w-5" /> : <GitBranch className="h-5 w-5" />}
              />
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-300">Next step: we’ll detect mods that exist on only one platform.</div>

          <PrimaryButton
            onClick={() => {
              setStep("unsupported-mods");
              navigate("/unsupported-mods");
            }}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}