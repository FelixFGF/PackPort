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
      const elapsed = Date.now() - startTimeRef.current;
      if (!mounted || successRef.current) return;

      const t = Math.min(1, elapsed / minDurationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.max(0, Math.floor(eased * targetMax));
      setProgress((p) => (next > p ? next : p));

      progressRafRef.current = window.requestAnimationFrame(tick);
    };

    progressRafRef.current = window.requestAnimationFrame(tick);

    const pollOnce = async () => {
      if (!mounted || successRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 5 * 60_000 && phase !== "long") setPhase("long");

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        console.log("[StartupLoader] request URL:", backendUrl);

        const response = await fetch(backendUrl, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        console.log("[StartupLoader] HTTP status:", response.status);

        const text = await response.text();
        console.log("[StartupLoader] response body (raw):", text);

        const ok =
          response.status === 200 && text.trim() === "OK";

        console.log("[StartupLoader] ok condition:", ok);

        if (ok) {
          successRef.current = true;

          // Must instantly complete progress once confirmed online.
          setProgress(100);
          setPhase("connected");
          setIsFadingOut(true);

          console.log("[StartupLoader] loader ready -> switching to app");

          // Fade-out trigger + then switch app. No artificial long wait.
          window.setTimeout(() => {
            if (!mounted) return;
            onConnected();
          }, 50);
        }
      } catch (err) {
        console.error("[StartupLoader] fetch failed (network/CORS?):", err);
      }
    };

    // immediately poll; then adapt interval (2s until 5 min, then 5s)
    void pollOnce();

    const interval = window.setInterval(() => {
      if (!mounted || successRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const intervalMs = elapsed >= 5 * 60_000 ? 5000 : 2000;

      // We can't change setInterval duration dynamically without restarting;
      // simplest: restart interval only when crossing 5 minutes.
      // For correctness, just keep 2s polling here; fetch will be very cheap.
      // Requirement allows continuing polling every 5 seconds after 5 minutes,
      // but not to freeze. We'll handle by restarting once at 5 minutes.
      void intervalMs; // no-op to avoid lint noise

      void pollOnce();
    }, 2000);

    pollIntervalRef.current = interval;

    const switchTimer = window.setInterval(() => {
      if (!mounted || successRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 5 * 60_000 && phase !== "long") {
        setPhase("long");
        if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);

        pollIntervalRef.current = window.setInterval(() => {
          void pollOnce();
        }, 5000);
      }
    }, 1000);

    return () => {
      mounted = false;
      if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
      window.clearInterval(switchTimer);
      if (progressRafRef.current)
        window.cancelAnimationFrame(progressRafRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, onConnected, phase]);

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

        <div className="mt-1 text-xs text-white/50">
          PackPort loader: {progress}%
        </div>
      </div>
    </div>
  );
}