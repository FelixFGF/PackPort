import React, { useMemo } from "react";
import { Tag } from "../dashboard/DashboardPrimitives";
import { ErrorReportDto } from "../../../types/errorReports";

type Props = {
  open: boolean;
  report: ErrorReportDto | null;
  onClose: () => void;
  onResolve: () => void;
  onDelete: () => void;
  resolving: boolean;
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

export function ErrorReportDetailsModal(props: Props) {
  const r = props.report;

  const severityTag = useMemo(() => {
    if (!r?.severity) return null;
    const s = String(r.severity).toUpperCase();
    if (s.includes("CRIT") || s.includes("FATAL") || s.includes("HIGH")) return { tone: "bad" as const, label: s };
    if (s.includes("WARN")) return { tone: "warn" as const, label: s };
    if (s.includes("INFO") || s.includes("LOW")) return { tone: "info" as const, label: s };
    return { tone: "info" as const, label: s };
  }, [r?.severity]);

  if (!props.open || !r) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <span className="text-xl">🧯</span>
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">Error Report</div>
                  <div className="text-sm text-neutral-300 mt-0.5">
                    {formatDateTime(r.timestampUtc)} • ID: {r.id}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {severityTag ? <Tag tone={severityTag.tone}>{severityTag.label}</Tag> : null}
                {r.resolved ? <Tag tone="ok">RESOLVED</Tag> : <Tag tone="warn">UNRESOLVED</Tag>}
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

          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-100">Message</div>
            <div className="mt-1 text-sm text-neutral-200 whitespace-pre-wrap break-words">{r.errorMessage ?? "—"}</div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-neutral-100">Minecraft / Loader</div>
              <div className="mt-1 text-sm text-neutral-200">
                <div>Version: {r.minecraftVersion ?? "—"}</div>
                <div>Loader: {r.loader ?? "—"}</div>
                <div>Modpack: {r.modpackName ?? "—"}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-100">Runtime / Job</div>
              <div className="mt-1 text-sm text-neutral-200">
                <div>Job ID: {r.jobId ?? "—"}</div>
                <div>Browser: {r.browser ?? "—"}</div>
                <div>OS: {r.operatingSystem ?? "—"}</div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-100">Stacktrace</div>
            <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-200 whitespace-pre-wrap overflow-auto max-h-[260px]">
              {r.stacktrace ?? "(no stacktrace)"}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-100">Attached Logs</div>
            <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-200 whitespace-pre-wrap overflow-auto max-h-[200px]">
              {r.logs ?? "—"}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-100">Resolution & Timeline</div>
            <div className="mt-2 text-sm text-neutral-200 space-y-1">
              <div>Resolved: {r.resolved ? "Yes" : "No"}</div>
              <div>Resolved by: {r.resolvedBy ?? "—"}</div>
              <div>Resolved at: {formatDateTime(r.resolvedAt)}</div>
              <div className="text-neutral-400">Created at: {formatDateTime(r.timestampUtc)}</div>
            </div>

            {r.userNotes ? (
              <div className="mt-4">
                <div className="text-sm font-semibold text-neutral-100">User Notes</div>
                <div className="mt-1 text-sm text-neutral-200 whitespace-pre-wrap">{r.userNotes}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              {!r.resolved ? (
                <button
                  type="button"
                  onClick={props.onResolve}
                  disabled={props.resolving || props.deleting}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {props.resolving ? "Resolving..." : "Mark resolved"}
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={props.onDelete}
              disabled={props.deleting || props.resolving}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/15 disabled:opacity-60"
            >
              {props.deleting ? "Deleting..." : "Delete report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}