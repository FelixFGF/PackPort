import React, { useEffect, useMemo, useState } from "react";
import {
  ButtonPill,
  EmptyState,
  LoadingSkeleton,
  Tag,
} from "../dashboard/DashboardPrimitives";
import { ErrorReportDto } from "../../../types/errorReports";
import { ErrorReportsService } from "../../../services/ErrorReportsService";
import { ErrorReportDetailsModal } from "./ErrorReportDetailsModal";

type Severity = "ALL" | "UNRESOLVED" | "RESOLVED" | "CRITICAL" | "WARN" | "INFO";

function safeLower(v?: string | null) {
  return v ? String(v).toLowerCase() : "";
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

function severityTone(severity?: string | null): "ok" | "warn" | "bad" | "info" {
  if (!severity) return "info";
  const s = String(severity).toUpperCase();
  if (s.includes("CRIT") || s.includes("FATAL") || s.includes("HIGH")) return "bad";
  if (s.includes("WARN")) return "warn";
  if (s.includes("INFO") || s.includes("LOW")) return "info";
  return "info";
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

export function ErrorReportsTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [raw, setRaw] = useState<ErrorReportDto[]>([]);
  const [limitRequested, setLimitRequested] = useState(250);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<Severity>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<ErrorReportDto | null>(null);

  const [resolving, setResolving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const list = await ErrorReportsService.listAdminErrors(limitRequested);
      setRaw(list ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitRequested]);

  const filtered = useMemo(() => {
    const q = safeLower(search).trim();
    let out = [...raw];

    if (severity !== "ALL") {
      if (severity === "UNRESOLVED") out = out.filter((r) => !r.resolved);
      if (severity === "RESOLVED") out = out.filter((r) => !!r.resolved);
      if (severity === "CRITICAL")
        out = out.filter((r) => {
          const tone = severityTone(r.severity);
          return tone === "bad";
        });
      if (severity === "WARN")
        out = out.filter((r) => severityTone(r.severity) === "warn");
      if (severity === "INFO")
        out = out.filter((r) => {
          const t = severityTone(r.severity);
          return t === "info";
        });
    }

    if (q) {
      out = out.filter((r) => {
        const hay = [
          r.errorMessage,
          r.stacktrace,
          r.modpackName,
          r.minecraftVersion,
          r.loader,
          r.jobId,
          r.browser,
          r.operatingSystem,
          r.id,
          r.logs,
        ]
          .map((x) => safeLower(x))
          .join(" | ");
        return hay.includes(q);
      });
    }

    // Backend already returns desc; keep stable but ensure.
    out.sort((a, b) => {
      const at = a.timestampUtc ? Date.parse(a.timestampUtc) : 0;
      const bt = b.timestampUtc ? Date.parse(b.timestampUtc) : 0;
      return bt - at;
    });

    return out;
  }, [raw, search, severity]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  function openDetails(id: string) {
    setSelectedId(id);
    setDetailsOpen(true);
    void (async () => {
      setDetailsLoading(true);
      try {
        const d = await ErrorReportsService.getAdminError(id);
        setDetails(d);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    })();
  }

  async function handleResolve() {
    if (!selectedId) return;
    setResolving(true);
    try {
      const username = "Admin"; // resolvedBy is informational; backend audits separately.
      const updated = await ErrorReportsService.resolveAdminError(selectedId, username);
      setDetails(updated);
      // refresh client list softly:
      setRaw((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setResolving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    const id = selectedId;
    setDeleting(true);
    try {
      await ErrorReportsService.deleteAdminError(id);
      setDetailsOpen(false);
      setDetails(null);
      setRaw((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv() {
    const rows = filtered.map((r) => ({
      id: r.id,
      timestampUtc: r.timestampUtc ?? "",
      severity: r.severity ?? "",
      resolved: r.resolved ? "true" : "false",
      resolvedBy: r.resolvedBy ?? "",
      errorMessage: r.errorMessage ?? "",
      modpackName: r.modpackName ?? "",
      minecraftVersion: r.minecraftVersion ?? "",
      loader: r.loader ?? "",
      jobId: r.jobId ?? "",
      browser: r.browser ?? "",
      operatingSystem: r.operatingSystem ?? "",
      endpoint: "", // backend DTO doesn't expose endpoint in current schema
    }));
    const csv = toCsv(rows);
    downloadTextFile(`packport-error-reports-${Date.now()}.csv`, csv);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div className="flex-1">
          <div className="text-xs text-pp-muted mb-1">Search</div>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Message, stacktrace, modpack, job id..."
            className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div className="w-full md:w-44">
          <div className="text-xs text-pp-muted mb-1">Severity</div>
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value as Severity);
              setPage(1);
            }}
            className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
          >
            <option value="ALL">All</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARN">Warn</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        <div className="flex gap-2">
          <ButtonPill label="Export CSV" onClick={exportCsv} icon={<span>⤓</span>} />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton lines={7} />
      ) : error ? (
        <EmptyState title="Failed to load error reports" subtitle={error} />
      ) : !raw.length ? (
        <EmptyState title="No error reports yet" subtitle="When the frontend crashes, reports will appear here." />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-pp-muted">
              Showing <span className="text-pp-text font-semibold">{pageRows.length}</span> of{" "}
              <span className="text-pp-text font-semibold">{total}</span> results
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-pp-muted">Page size</div>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-xs text-pp-text outline-none"
              >
                {[10, 15, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-pp-border bg-white/5">
            <div className="grid grid-cols-12 gap-0 border-b border-pp-border/60 bg-white/5 px-4 py-3 text-xs text-pp-muted">
              <div className="col-span-2 truncate">Timestamp</div>
              <div className="col-span-2 truncate">Severity</div>
              <div className="col-span-3 truncate">Message</div>
              <div className="col-span-2 truncate">Modpack</div>
              <div className="col-span-1 truncate">Resolved</div>
              <div className="col-span-2 truncate">Actions</div>
            </div>

            <div className="divide-y divide-pp-border/60">
              {pageRows.map((r) => {
                const tone = severityTone(r.severity);
                return (
                  <div key={r.id} className="grid grid-cols-12 px-4 py-3 text-sm items-center">
                    <div className="col-span-2 truncate text-pp-muted">{formatDateTime(r.timestampUtc ?? null)}</div>
                    <div className="col-span-2 truncate">
                      {r.severity ? <Tag tone={tone}>{String(r.severity).toUpperCase()}</Tag> : <Tag tone="info">UNKNOWN</Tag>}
                    </div>
                    <div className="col-span-3 truncate">{r.errorMessage ?? "—"}</div>
                    <div className="col-span-2 truncate text-pp-muted">{r.modpackName ?? "—"}</div>
                    <div className="col-span-1 truncate">
                      {r.resolved ? <Tag tone="ok">YES</Tag> : <Tag tone="warn">NO</Tag>}
                    </div>
                    <div className="col-span-2 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openDetails(r.id)}
                        className="rounded-xl border border-pp-border bg-white/5 px-3 py-2 text-xs font-semibold text-pp-text hover:bg-white/10"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-pp-muted">
              Page <span className="text-pp-text font-semibold">{safePage}</span> /{" "}
              <span className="text-pp-text font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-pp-border bg-white/5 px-3 py-2 text-xs font-semibold text-pp-text hover:bg-white/10 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-pp-border bg-white/5 px-3 py-2 text-xs font-semibold text-pp-text hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ErrorReportDetailsModal
        open={detailsOpen}
        report={details}
        onClose={() => {
          setDetailsOpen(false);
          setDetails(null);
          setSelectedId(null);
        }}
        onResolve={handleResolve}
        onDelete={handleDelete}
        resolving={resolving || detailsLoading}
        deleting={deleting || detailsLoading}
      />
    </div>
  );
}