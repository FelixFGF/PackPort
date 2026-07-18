import React from "react";
import { Tag } from "../dashboard/DashboardPrimitives";
import { ApplicationLogDto } from "../../../types/applicationLogs";

type Props = {
  open: boolean;
  log: ApplicationLogDto | null;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
};

function formatDateTime(v?: string | null): string {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString();
  } catch {
    return v;
  }
}

function levelTone(level?: string | null): "ok" | "warn" | "bad" | "info" {
  const s = (level ?? "").toUpperCase();
  if (!s) return "info";
  if (s.includes("ERROR") || s.includes("FATAL") || s.includes("CRIT")) return "bad";
  if (s.includes("WARN")) return "warn";
  if (s.includes("DEBUG") || s.includes("TRACE")) return "info";
  return "ok";
}

export function LogDetailsModal(props: Props) {
  const { open, log } = props;
  if (!open || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-pp-text">
                  🧾
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">Log Details</div>
                  <div className="mt-0.5 text-sm text-neutral-300">
                    {formatDateTime(log.timestampUtc)} • ID: {String(log.id)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {log.level ? <Tag tone={levelTone(log.level)}>{String(log.level).toUpperCase()}</Tag> : null}
                {log.jobId ? <Tag tone="info">JOB</Tag> : null}
              </div>
            </div>

            <button
              type="button"
              onClick={props.onClose}
              className="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-white/5"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-neutral-100">Request</div>
              <div className="mt-1 text-sm text-neutral-200 space-y-1">
                <div>Path: {log.requestPath ?? "—"}</div>
                <div>Logger: {log.logger ?? "—"}</div>
                {log.source ? <div>Source: {log.source}</div> : null}
                {log.threadName ? <div>Thread: {log.threadName}</div> : null}
                {log.correlationId ? <div>Correlation: {log.correlationId}</div> : null}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-neutral-100">Job / Timing</div>
              <div className="mt-1 text-sm text-neutral-200 space-y-1">
                <div>Job ID: {log.jobId ?? "—"}</div>
                <div>Duration: {log.durationMs != null ? `${log.durationMs} ms` : "—"}</div>
                {log.userAgent ? <div>User agent: {log.userAgent}</div> : null}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-100">Message</div>
            <div className="mt-1 text-sm text-neutral-200 whitespace-pre-wrap break-words">{log.message ?? "—"}</div>
          </div>

          {log.stacktrace || log.exceptionText ? (
            <div className="mt-5">
              <div className="text-sm font-semibold text-neutral-100">Stacktrace</div>
              <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-200 whitespace-pre-wrap overflow-auto max-h-[260px]">
                {log.stacktrace ?? log.exceptionText ?? "(no stacktrace)"}
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-100">Exception Text</div>
            <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-200 whitespace-pre-wrap overflow-auto max-h-[180px]">
              {log.exceptionText ?? "—"}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={props.onDelete}
              disabled={props.deleting}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/15 disabled:opacity-60"
            >
              {props.deleting ? "Deleting..." : "Delete log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}