import React, { useEffect, useMemo, useState } from "react";
import { ButtonPill, EmptyState, LoadingSkeleton, Tag } from "../dashboard/DashboardPrimitives";
import { AdminLogsService, PagedResponse } from "../../../api/adminLogs";
import { ApplicationLogDto } from "../../../types/applicationLogs";
import { LogDetailsModal } from "./LogDetailsModal";

type LogLevel = "ALL" | "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

function levelTone(level?: string | null): "ok" | "warn" | "bad" | "info" {
  const s = (level ?? "").toUpperCase();
  if (!s) return "info";
  if (s.includes("ERROR") || s.includes("FATAL") || s.includes("CRIT")) return "bad";
  if (s.includes("WARN")) return "warn";
  if (s.includes("DEBUG") || s.includes("TRACE")) return "info";
  return "ok";
}

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

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, string | number | boolean | null | undefined>[]) {
  const headers = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );

  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export function LogsTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0); // backend is 0-based
  const [size, setSize] = useState(25);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [level, setLevel] = useState<LogLevel>("ALL");
  const [logger, setLogger] = useState("");
  const [message, setMessage] = useState("");
  const [jobId, setJobId] = useState("");
  const [requestPath, setRequestPath] = useState("");

  // Date filters
  const [from, setFrom] = useState<string>(""); // datetime-local string
  const [to, setTo] = useState<string>("");

  // sorting toggle (UI only; backend sorts timestampUtc desc by default)
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const [data, setData] = useState<ApplicationLogDto[]>([]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<ApplicationLogDto | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  function datetimeLocalToIso(s: string) {
    if (!s) return undefined;
    try {
      // Treat local datetime as local time, convert to ISO.
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return undefined;
      return d.toISOString();
    } catch {
      return undefined;
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const resp: PagedResponse<ApplicationLogDto> = await AdminLogsService.listAdminLogs({
        page,
        size,
        level: level === "ALL" ? undefined : level,
        logger: logger.trim() ? logger.trim() : undefined,
        message: message.trim() ? message.trim() : undefined,
        jobId: jobId.trim() ? jobId.trim() : undefined,
        requestPath: requestPath.trim() ? requestPath.trim() : undefined,
        from: datetimeLocalToIso(from),
        to: datetimeLocalToIso(to),
        sort,
      });

      setData(resp.content ?? []);
      setTotalElements(resp.totalElements ?? 0);
      setTotalPages(resp.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, level, logger, message, jobId, requestPath, from, to, sort]);

  function openDetails(id: string) {
    setSelectedId(id);
    setDetailsOpen(true);
    void (async () => {
      setDetailsLoading(true);
      try {
        const d = await AdminLogsService.getAdminLog(id);
        setDetails(d);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    })();
  }

  async function handleDelete() {
    if (!selectedId) return;
    setDeleting(true);
    setError(null);
    try {
      await AdminLogsService.deleteAdminLog(selectedId);
      setDetailsOpen(false);
      setDetails(null);
      setSelectedId(null);
      // Reload current page (server-side pagination)
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv() {
    const rows = data.map((l) => ({
      id: String(l.id),
      timestampUtc: l.timestampUtc ?? "",
      level: l.level ?? "",
      logger: l.logger ?? "",
      requestPath: l.requestPath ?? "",
      message: l.message ?? "",
      jobId: l.jobId ?? "",
      correlationId: l.correlationId ?? "",
      threadName: l.threadName ?? "",
      durationMs: l.durationMs ?? "",
    }));
    const csv = toCsv(rows);
    downloadTextFile(`packport-logs-${Date.now()}.csv`, csv);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div>
            <div className="text-xs text-pp-muted mb-1">Log level</div>
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value as LogLevel);
                setPage(0);
              }}
              className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
            >
              <option value="ALL">All</option>
              <option value="TRACE">Trace</option>
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
              <option value="ERROR">Error</option>
              <option value="FATAL">Fatal</option>
            </select>
          </div>

          <div>
            <div className="text-xs text-pp-muted mb-1">Logger</div>
            <input
              value={logger}
              onChange={(e) => {
                setLogger(e.target.value);
                setPage(0);
              }}
              placeholder="e.g. packbridge"
              className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
            />
          </div>

          <div>
            <div className="text-xs text-pp-muted mb-1">Request path</div>
            <input
              value={requestPath}
              onChange={(e) => {
                setRequestPath(e.target.value);
                setPage(0);
              }}
              placeholder="/api/..."
              className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
            />
          </div>

          <div>
            <div className="text-xs text-pp-muted mb-1">Job/Conversion ID</div>
            <input
              value={jobId}
              onChange={(e) => {
                setJobId(e.target.value);
                setPage(0);
              }}
              placeholder="job-uuid-or-id"
              className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
            />
          </div>
        </div>

        <div className="w-full lg:w-[360px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-pp-muted mb-1">From</div>
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(0);
                }}
                className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
              />
            </div>
            <div>
              <div className="text-xs text-pp-muted mb-1">To</div>
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(0);
                }}
                className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-pp-muted mb-1">Message contains</div>
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setPage(0);
              }}
              placeholder="error, conversion, stack..."
              className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
            />
          </div>

          <div className="mt-3 flex gap-2 items-center justify-between">
            <div className="text-xs text-pp-muted">Sort</div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as any);
                setPage(0);
              }}
              className="rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-xs text-pp-text outline-none"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>

          <div className="mt-3 flex gap-2 justify-end">
            <ButtonPill label="Export CSV" onClick={exportCsv} icon={<span>⤓</span>} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton lines={7} />
      ) : error ? (
        <EmptyState title="Failed to load logs" subtitle={error} />
      ) : !data.length ? (
        <EmptyState title="No logs found" subtitle="Try adjusting filters." />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-pp-muted">
              Page{" "}
              <span className="text-pp-text font-semibold">{page + 1}</span> /{" "}
              <span className="text-pp-text font-semibold">{totalPages}</span>
              <span className="ml-2">
                • <span className="text-pp-text font-semibold">{totalElements}</span> total entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-pp-muted">Page size</div>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-xs text-pp-text outline-none"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-xl border border-pp-border bg-white/5 px-3 py-2 text-xs font-semibold text-pp-text hover:bg-white/10 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="rounded-xl border border-pp-border bg-white/5 px-3 py-2 text-xs font-semibold text-pp-text hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-pp-border bg-white/5">
            <div className="grid grid-cols-12 gap-0 border-b border-pp-border/60 bg-white/5 px-4 py-3 text-xs text-pp-muted">
              <div className="col-span-2 truncate">Timestamp</div>
              <div className="col-span-1 truncate">Level</div>
              <div className="col-span-2 truncate">Logger</div>
              <div className="col-span-3 truncate">Request path</div>
              <div className="col-span-2 truncate">Job</div>
              <div className="col-span-2 truncate">Message</div>
            </div>

            <div className="divide-y divide-pp-border/60">
              {data.map((l) => (
                <div key={String(l.id)} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                  <div className="col-span-2 truncate text-pp-muted">{formatDateTime(l.timestampUtc ?? null)}</div>
                  <div className="col-span-1 truncate">
                    {l.level ? <Tag tone={levelTone(l.level)}>{l.level.toUpperCase()}</Tag> : null}
                  </div>
                  <div className="col-span-2 truncate">{l.logger ?? "—"}</div>
                  <div className="col-span-3 truncate text-pp-muted">{l.requestPath ?? "—"}</div>
                  <div className="col-span-2 truncate text-pp-muted">{l.jobId ?? "—"}</div>
                  <div className="col-span-2 truncate">
                    <button
                      type="button"
                      onClick={() => openDetails(String(l.id))}
                      className="inline-flex items-center gap-2 rounded-xl border border-pp-border bg-white/5 px-3 py-2 text-xs font-semibold text-pp-text hover:bg-white/10"
                      title="Open details"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <LogDetailsModal
        open={detailsOpen}
        log={details}
        onClose={() => {
          setDetailsOpen(false);
          setDetails(null);
          setSelectedId(null);
        }}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}