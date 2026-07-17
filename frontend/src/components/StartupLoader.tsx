import React, { useEffect, useMemo, useRef, useState } from "react";

type StartupLoaderProps = {
  onConnected: () => void;
};

export function StartupLoader({ onConnected }: StartupLoaderProps) {
  const [phase, setPhase] = useState<"connecting" | "connected" | "long">(
    "connecting"
  );
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const successRef = useRef(false);

  const progressRafRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const backendUrl = useMemo(
    () => "https://packport-backend.onrender.com/api/health",
    []
  );

  useEffect(() => {
    let mounted = true;

    // purely visual progress animation (no blocking)
    const targetMax = 90;
    const minDurationMs = 40_000;

    const tick = () => {
      if (!mounted || successRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const t = Math.min(1, elapsed / minDurationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.max(0, Math.floor(eased * targetMax));

      setProgress((p) => (next > p ? next : p));

      progressRafRef.current = window.requestAnimationFrame(tick);
    };

    progressRafRef.current = window.requestAnimationFrame(tick);

    const pollOnce = async () => {
      if (!mounted || successRef.current) return;

      // phase text only (visual) — does NOT re-run polling effect
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 5 * 60_000) setPhase("long");

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        console.log("[StartupLoader] request URL", backendUrl);

        const response = await fetch(backendUrl, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        console.log("status", response.status);

        // Health endpoint now returns JSON:
        //   { "status": "UP", "timestamp": "..." }
        // so consider backend online when status is UP (keep backward compatible with old "OK" text).
        let connectedNow = false;

        const contentType = response.headers.get("content-type") ?? "";
        if (response.status === 200 && contentType.includes("application/json")) {
          const data = await response.json();
          connectedNow = data?.status === "UP";
        } else {
          const text = await response.text();
          console.log("body", text);
          connectedNow = response.status === 200 && text.trim() === "OK";
        }

        if (connectedNow) {
          console.log("connected");
          successRef.current = true;

          // required behavior: instantly finish and immediately free app
          setProgress(100);
          setPhase("connected");
          setIsFadingOut(true);

          // Stop polling + timeouts immediately
          if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;

          if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
          fadeTimeoutRef.current = null;

          if (abortRef.current) abortRef.current.abort();

          // Must fire onConnected right away after confirmation
          console.log("onConnected fired");
          onConnected();
        }
      } catch (error) {
        // required: show exact errors
        console.error(error);
      }
    };

    // Single polling interval:
    // - first request immediately
    // - then every 2s; after 5 minutes, switch to 5s (still ONE interval mechanism by restarting)
    let intervalMs = 2000;

    const applyInterval = () => {
      if (!mounted) return;

      const elapsed = Date.now() - startTimeRef.current;
      const nextInterval = elapsed >= 5 * 60_000 ? 5000 : 2000;

      if (nextInterval !== intervalMs) {
        intervalMs = nextInterval;
        if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = window.setInterval(() => {
          void pollOnce();
        }, intervalMs);
      }
    };

    void pollOnce();

    pollIntervalRef.current = window.setInterval(() => {
      applyInterval();
      void pollOnce();
    }, 2000);

    return () => {
      mounted = false;

      if (progressRafRef.current) window.cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;

      if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;

      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;

      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, onConnected]);

  return (
    <div
      className={[
        "fixed inset-0 z-[1000] flex items-center justify-center bg-[#0b0f1a] transition-opacity duration-500",
        isFadingOut ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex w-full max-w-xl flex-col items-center gap-6 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <img
            src="/assets/xxx.txt"
            alt="PackPort"
            className="h-10 w-10 select-none"
          />
        </div>

        <div className="text-white">
          <div className="text-3xl font-semibold">Waking up PackPort...</div>
          <div className="mt-3 text-sm text-white/70">
            {phase === "long" ? (
              "The server is taking longer than expected. Please keep this page open."
            ) : (
              <>
                Our free server is starting.
                <br />
                This usually takes 30–60 seconds.
              </>
            )}
          </div>
        </div>

        <div className="w-full">
          <div className="mb-2 text-left text-xs font-medium text-white/60">
            {phase === "connected" ? "Connected!" : "Connecting to backend..."}
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
        </div>

        <div className="mt-1 text-xs text-white/50">PackPort loader: {progress}%</div>
      </div>
    </div>
  );
}