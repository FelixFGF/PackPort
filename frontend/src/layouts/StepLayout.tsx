import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GitFork, Lock, LoaderCircle, Sparkles } from "lucide-react";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";

const steps: Array<{ path: string; label: string; short: string }> = [
  { path: "/", label: "Welcome", short: "1" },
  { path: "/scan", label: "Scan", short: "2" },
  { path: "/target", label: "Target", short: "3" },
  { path: "/unsupported-mods", label: "Unsupported Mods", short: "4" },
  { path: "/convert", label: "Conversion", short: "5" },
  { path: "/finished", label: "Finished", short: "6" },
];

function pathToIndex(pathname: string) {
  const found = steps.findIndex((s) => s.path === pathname);
  return found >= 0 ? found : 0;
}

export function StepLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { uploadFileName, jobId, step } = usePackBridgeFlow();
  const { status } = useJobStatus(jobId);

  const activeIndex = pathToIndex(location.pathname);

  // Guard: if user opens any step route without job context, redirect to Welcome.
  useEffect(() => {
    if (
      // Fix inconsistent jobId source during hydration:
      // Only redirect if we truly have no active job (no jobId) AND backend is not DONE/FAILED yet.
      // This prevents an early redirect that would hide manifestInfo on /finished.
      !jobId &&
      location.pathname !== "/" &&
      status !== "DONE" &&
      status !== "FAILED"
    ) {
      console.log("[StepLayout] guard redirect to /", {
        locationPath: location.pathname,
        jobId,
        status,
      });
      navigate("/", { replace: true });
    }
  }, [jobId, location.pathname, navigate, status]);

  // Route sync: on mount only, ensure URL matches restored step.
  useEffect(() => {
    const targetPath = steps.find((s) => {
      // Map wizard step key -> route path.
      switch (step) {
        case "welcome":
          return s.path === "/";
        case "scan":
          return s.path === "/scan";
        case "target":
          return s.path === "/target";
        case "unsupported-mods":
          return s.path === "/unsupported-mods";
        case "convert":
          return s.path === "/convert";
        case "finished":
          return s.path === "/finished";
        default:
          return false;
      }
    })?.path;

    if (!targetPath) return;
    if (location.pathname !== targetPath) {
      console.log("[StepLayout] route sync", {
        step,
        targetPath,
        currentPath: location.pathname,
        jobId,
      });
      navigate(targetPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepState = useMemo(() => {
    const hasJob = Boolean(jobId);

    // Strict backend-driven progression:
    // - SCANNING => unlock Scan and (optionally) keep others locked
    // - CONVERTING => unlock Target and Conversion, keep Finished locked
    // - DONE => unlock all the way to Finished
    const isScanning = status === "SCANNING";
    const isConverting = status === "CONVERTING";
    const isDone = status === "DONE";
    const isFailed = status === "FAILED";

    const step1Unlocked = true;

    const step2Unlocked = hasJob && (isScanning || isConverting || isDone || isFailed);
    const step3Unlocked = hasJob && (isConverting || isDone || isFailed);

    // Keep step 4 locked until backend explicitly progresses to the later pipeline stage.
    // This is intentionally conservative to avoid client prediction.
    const step4Unlocked = false;

    const step5Unlocked = hasJob && (isDone || isFailed);
    const step6Unlocked = hasJob && isDone;

    return [step1Unlocked, step2Unlocked, step3Unlocked, step4Unlocked, step5Unlocked, step6Unlocked];
  }, [jobId, status]);

  const lockTooltip = "Complete the previous step first.";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-cyan-500/20 to-amber-500/20 ring-1 ring-white/10">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-zinc-200">PackPort</div>
              <div className="text-xs text-zinc-400">CurseForge ↔ Modrinth Converter</div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-200 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <GitFork className="h-4 w-4 text-fuchsia-300" />
              Wizard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-400 ring-1 ring-white/10">
              <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
              Mock mode
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((s, i) => {
              const isActive = i === activeIndex;
              const isDone = i < activeIndex;

              const unlocked = stepState[i] ?? false;

              // Completed steps remain clickable. Future locked steps are non-clickable.
              const isLocked = !unlocked && !isDone;

              const sharedClassName = [
                "group relative flex min-w-[120px] items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition",
                "bg-white/5 ring-white/10 hover:bg-white/10",
                isActive ? "bg-white/10 ring-cyan-300/40" : "",
                isDone ? "bg-emerald-500/10 ring-emerald-300/30" : "",
                isLocked ? "cursor-not-allowed opacity-60 hover:bg-white/5" : "",
              ].join(" ");

              const badgeClassName = [
                "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold ring-1",
                isDone
                  ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25"
                  : isActive
                    ? "bg-cyan-400/15 text-cyan-200 ring-cyan-300/25"
                    : "bg-white/5 text-zinc-300 ring-white/10 group-hover:text-zinc-200",
                isLocked ? "text-zinc-400 ring-white/5" : "",
              ].join(" ");

              const badgeContent = isDone ? (
                <span className="relative -top-[0.5px]">✓</span>
              ) : isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                s.short
              );

              const labelStatus = isActive ? "Now" : isDone ? "Done" : isLocked ? "Locked" : "Next";

              const inner = (
                <>
                  <span className={badgeClassName}>{badgeContent}</span>
                  <span className="flex-1 text-left">
                    <div className="truncate text-xs font-medium text-zinc-200">{s.label}</div>
                    <div className="text-[11px] text-zinc-500">{labelStatus}</div>
                  </span>
                </>
              );

              // Locked steps: no Link, no navigation, no click events
              if (isLocked) {
                return (
                  <div
                    key={s.path}
                    className={sharedClassName}
                    title={lockTooltip}
                    aria-disabled="true"
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {inner}
                  </div>
                );
              }

              // Only render Link for completed and current steps
              return (
                <Link key={s.path} to={s.path} className={sharedClassName}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex flex-col gap-6 border-t border-white/5 pt-8 text-xs text-zinc-500 sm:flex-row sm:items-start sm:justify-between">
          {/* Left section */}
          <div className="flex items-start gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-cyan-500/20 to-amber-500/20 ring-1 ring-white/10">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent" />
            </div>

            <div className="leading-snug">
              <div className="text-sm font-medium text-zinc-200">PackPort</div>
              <div className="mt-1 text-[12px] text-zinc-400">CurseForge ↔ Modrinth Profile Converter</div>
            </div>
          </div>

          {/* Center section */}
          <div className="max-w-md whitespace-pre-line text-[12px] leading-relaxed text-zinc-500">
            © 2026 FelixFGF {"\n"}
            All rights reserved. {"\n\n"}
            PackPort is a fan-made project. {"\n"}
            Not affiliated with Mojang, CurseForge or Modrinth.
          </div>

          {/* Right section */}
          <div className="w-full sm:w-auto">
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="text-sm font-medium text-zinc-200">Need Help?</div>
              <div className="mt-1 text-[12px] leading-snug text-zinc-400">
                Join our Discord community if you have questions, want to report bugs, or suggest new features.
              </div>

              <a
                href="https://discord.gg/9Ytd5vCrrY"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400/15 px-4 py-2.5 text-sm font-medium text-cyan-200 ring-1 ring-cyan-300/30 transition hover:bg-cyan-400/20 sm:w-auto"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}