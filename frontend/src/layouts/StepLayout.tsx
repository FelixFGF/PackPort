import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GitFork, Lock, LoaderCircle } from "lucide-react";
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

function getSessionItem(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function StepLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { uploadFileName, jobId, step } = usePackBridgeFlow();
  const { status } = useJobStatus(jobId);

  const [discordModalOpen, setDiscordModalOpen] = useState(false);

  const [alphaModalOpen, setAlphaModalOpen] = useState(false);
  const ALPHA_SESSION_KEY = "packport.alphaNoticeShown";

  const activeIndex = pathToIndex(location.pathname);

  // Alpha warning: show once per session when user first opens the website.
  useEffect(() => {
    const alreadyShown = getSessionItem(ALPHA_SESSION_KEY) === "1";
    if (!alreadyShown) {
      setAlphaModalOpen(true);
    }
  }, []);

  const closeAlphaModal = () => {
    setAlphaModalOpen(false);
    setSessionItem(ALPHA_SESSION_KEY, "1");
  };

  // Guard: if user opens any step route without job context, redirect to Welcome.
  useEffect(() => {
    if (!jobId && location.pathname !== "/" && status !== "DONE" && status !== "FAILED") {
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

    const isScanning = status === "SCANNING";
    const isConverting = status === "CONVERTING";
    const isDone = status === "DONE";
    const isFailed = status === "FAILED";

    const step1Unlocked = true;

    const step2Unlocked = hasJob && (isScanning || isConverting || isDone || isFailed);

    const step3Unlocked = hasJob && (isConverting || isDone || isFailed);

    const step4Unlocked = false;

    const step5Unlocked = hasJob && (isDone || isFailed);

    const step6Unlocked = hasJob && isDone;

    return [
      step1Unlocked,
      step2Unlocked,
      step3Unlocked,
      step4Unlocked,
      step5Unlocked,
      step6Unlocked,
    ];
  }, [jobId, status]);

  const lockTooltip = "Complete the previous step first.";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-cyan-500/20 to-amber-500/20 ring-1 ring-white/10">
              <img src="/assets/images/packport-logo.png" alt="PackPort" className="h-10 w-10" />
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
              <img src="/assets/images/packport-logo.png" alt="PackPort" className="h-10 w-10" />
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

              <button
                type="button"
                onClick={() => setDiscordModalOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400/15 px-4 py-2.5 text-sm font-medium text-cyan-200 ring-1 ring-cyan-300/30 transition hover:bg-cyan-400/20 sm:w-auto"
              >
                Join Discord
              </button>
            </div>
          </div>
        </div>
      </footer>

      {alphaModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-gradient-to-b from-red-500/10 via-zinc-950 to-zinc-950 p-6 shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_0_34px_rgba(239,68,68,0.18)]">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-red-400/25 bg-red-500/10 shadow-[0_0_24px_rgba(239,68,68,0.25)]">
                <span className="text-xl">⚠️</span>
              </div>

              <div className="leading-tight">
                <div className="text-xl font-extrabold text-zinc-50">
                  ⚠️ PackPort is currently in <span className="text-red-400">Alpha</span>
                </div>
                <div className="mt-1 text-[13px] font-medium text-red-200/90">Early build</div>
              </div>
            </div>

            <div className="mt-4 text-sm leading-relaxed text-zinc-300">
              PackPort is still in early development.
            </div>

            <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 shadow-[0_0_0_1px_rgba(239,68,68,0.12)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-100">
                <span>🚀</span>
                <span>Currently supported conversion</span>
              </div>
              <div className="mt-2 text-sm text-zinc-200">CurseForge (.zip) → Modrinth (.mrpack)</div>
            </div>

            <div className="mt-3 text-sm leading-relaxed text-zinc-300">
              <span className="text-zinc-100">💡</span>{" "}
              Some features may not work correctly yet. Feedback is welcome!
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeAlphaModal}
                className="rounded-2xl bg-red-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-1 ring-red-300/20 transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {discordModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-lg">
            <div className="text-lg font-semibold text-zinc-50">Community Server</div>
            <div className="mt-2 text-sm leading-relaxed text-zinc-300">
              Our Discord community server is still in development. Stay tuned!
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setDiscordModalOpen(false)}
                className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-white/10 hover:bg-white/15 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}