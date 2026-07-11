import { useEffect, useMemo, useRef, useState } from "react";
import type { UnsupportedMod } from "../types/packbridge";

type ManifestMod = {
  modId: string;
  title?: string;
};

type ManifestInfo = {
  packName?: string;
  packVersion?: string;
  author?: string;
  minecraftVersion?: string;
  loader?: string;
  imagePath?: string;
  totalMods?: number;
  mods?: ManifestMod[];
};

type JobStatus = {
  status: string;
  progress: number;
  detectedMods: unknown[];
  compatibilityResults: unknown[];
  unsupportedMods: UnsupportedMod[];
  warnings: string[];
  manifestInfo?: ManifestInfo;
  modpackType?: string;

  // Needed by FinishedPage download
  outputFileName?: string;

  // Needed by ScanResultPage
  logs?: string[];
  logEntries?: string[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// MUST use the same backend base URL everywhere (Netlify otherwise breaks /api/*)
const API_BASE =
  import.meta.env.VITE_API_URL ?? "https://packport-backend.onrender.com";

function toApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function fetchJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(toApiUrl(`/api/job/${encodeURIComponent(jobId)}`));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Job polling failed (${res.status}). ${text}`.trim());
  }

  const json = (await res.json()) as ApiResponse<JobStatus>;

  if (!json?.success) {
    throw new Error(json?.message ?? "Job polling failed.");
  }

  console.log("[useJobStatus] jobId", jobId);
  console.log("[useJobStatus] job response", json.data);

  return json.data;
}

/**
 * Polls /api/job/{jobId} every 1-2s until DONE/FAILED.
 */
export function useJobStatus(jobId?: string) {
  const [job, setJob] = useState<JobStatus | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDone, setIsDone] = useState(false);

  // Reset isDone when jobId changes to ensure fresh polling for a new job.
  useEffect(() => {
    setIsDone(false);
  }, [jobId]);

  const shouldPoll = useMemo(() => !!jobId && !isDone, [jobId]);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!shouldPoll || !jobId) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const next = await fetchJob(jobId);
        if (cancelled) return;

        setJob(next);

        const st = String(next?.status ?? "");
        if (st === "DONE" || st === "FAILED") {
          setIsDone(true);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to poll job status.");
      }
    };

    // immediate first tick
    tick();

    // then poll every 1.5s (within 1-2s requirement)
    timerRef.current = window.setInterval(() => {
      tick();
    }, 1500);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [jobId, shouldPoll]);

  return {
    job,
    status: job?.status,
    progress: job?.progress ?? 0,
    detectedMods: job?.detectedMods ?? [],
    compatibilityResults: job?.compatibilityResults ?? [],
    unsupportedMods: job?.unsupportedMods ?? [],
    warnings: job?.warnings ?? [],
    manifestInfo: job?.manifestInfo,
    modpackType: job?.modpackType,
    outputFileName: job?.outputFileName,
    logs: job?.logs ?? [],
    logEntries: job?.logEntries ?? [],
    error,
    isDone,
  };
}