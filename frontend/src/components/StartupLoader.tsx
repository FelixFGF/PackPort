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

    const targetMax = 90;
    const minDurationMs = 40_000; // 0 -> ~90% feeling
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (!mounted || successRef.current) return;

      // Ease to 90% over minDurationMs, then keep drifting to ~90.
      const t = Math.min(1, elapsed / minDurationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.max(0, Math.floor(eased * targetMax));
      setProgress((p) => (next > p ? next : p));

      progressRafRef.current = window.requestAnimationFrame(tick);
    };

    progressRafRef.current = window.requestAnimationFrame(tick);

    const poll = async () => {
      if (!mounted || successRef.current) return;

      // after 5 minutes switch to longer mode, but keep polling
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 5 * 60_000 && phase !== "long") {
        setPhase("long");
      }

      // Abort previous request if any
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(backendUrl, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.status === 200) {
          const text = (await res.text()).trim();
          if (text === "OK") {
            successRef.current = true;

            // instantly finish progress, then fade out
            setProgress(100);

            setPhase("connected");
            setIsFadingOut(true);

            // Give the fade a moment so the user sees it.
            window.setTimeout(() => {
              if (!mounted) return;
              onConnected();
            }, 450);

            return;
          }
        }
      } catch {
        // ignore and keep polling
      }
    };

    // initial poll immediately, then every 2 seconds
    poll();
    pollIntervalRef.current = window.setInterval(poll, 2000);

    return () => {
      mounted = false;
      if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
      if (progressRafRef.current)
        window.cancelAnimationFrame(progressRafRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, onConnected]);

  useEffect(() => {
    // Switch interval after 5 minutes requirement: every 5 seconds
    // without refetch logic changes. We implement by adjusting interval based on elapsed time.
    // This effect only manages interval changes.
    const id = window.setInterval(() => {
      if (successRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const shouldBeLongInterval = elapsed >= 5 * 60_000;
      const currentInterval = pollIntervalRef.current;

      // We can't reliably read current interval duration; instead we just toggle when phase changes.
      if (shouldBeLongInterval && phase === "long") {
        if (currentInterval) window.clearInterval(currentInterval);
        pollIntervalRef.current = window.setInterval(() => {
          // use the same fetch logic by triggering phase-based poll via a state update cycle:
          // easiest: call onConnected won't happen; so just keep polling by invoking a separate fetch.
          // To avoid duplication, we rely on the existing poll loop interval already calling every 2s.
          // However requirement says change to 5s. We'll replace interval with 5s calls by calling fetch directly here.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          (async () => {
            if (successRef.current) return;

            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            try {
              const res = await fetch(backendUrl, {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
              });

              if (res.status === 200) {
                const text = (await res.text()).trim();
                if (text === "OK") {
                  successRef.current = true;
                  setProgress(100);
                  setPhase("connected");
                  setIsFadingOut(true);
                  window.setTimeout(() => {
                    onConnected();
                  }, 450);
                }
              }
            } catch {
              // ignore
            }
          })();
        }, 5000);
      }
    }, 1000);

    return () => window.clearInterval(id);
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