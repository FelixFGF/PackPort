import React, { useMemo, useState } from "react";
import { EmptyState, LoadingSkeleton, ButtonPill, Tag } from "../dashboard/DashboardPrimitives";
import { fetchSecurityEvents } from "../../../api/adminSecurity";
import type { PagedResponse, SecurityEventRow } from "../../../api/adminSecurity";

type SortDir = "asc" | "desc";

function formatDateTime(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function severityTone(severity: string | undefined | null) {
  const s = (severity ?? "").toUpperCase();
  if (s === "ERROR" || s === "CRITICAL") return "bad";
  if (s === "WARN" || s === "WARNING") return "warn";
  if (s === "INFO") return "ok";
  return "neutral";
}

export default function EnterpriseSecurityEventsTable({
  refreshKey,
  initialFilters,
}: {
  refreshKey: number;
  initialFilters: {
    search?: string;
    severity?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  };
}) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const [sortBy, setSortBy] = useState<string>("occurredAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [severity, setSeverity] = useState(initialFilters.severity ?? "ALL");
  const [eventType, setEventType] = useState(initialFilters.eventType ?? "");
  const [startDate, setStartDate] = useState(initialFilters.startDate ?? "");
  const [endDate, setEndDate] = useState(initialFilters.endDate ?? "");

  const [data, setData] = useState<PagedResponse<SecurityEventRow> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Preserve filters/search/sort/pagination; refreshKey just triggers re-fetch.
  const queryKey = useMemo(() => {
    return {
      page,
      pageSize,
      sortBy,
      sortDir,
      search,
      severity,
      eventType,
      startDate,
      endDate,
      refreshKey,
    };
  }, [page, pageSize, sortBy, sortDir, search, severity, eventType, startDate, endDate, refreshKey]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchSecurityEvents({
      page: queryKey.page,
      pageSize: queryKey.pageSize,
      sortBy: queryKey.sortBy,
      sortDir: queryKey.sortDir,
      search: queryKey.search ? queryKey.search : undefined,
      severity: queryKey.severity && queryKey.severity !== "ALL" ? queryKey.severity : undefined,
      eventType: queryKey.eventType ? queryKey.eventType : undefined,
      startDate: queryKey.startDate || undefined,
      endDate: queryKey.endDate || undefined,
    })
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load security events");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [queryKey]);

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (loading && !data) {
    return <LoadingSkeleton lines={10} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Security events unavailable"
        subtitle={error}
        action={
          <ButtonPill
            label="Retry"
            onClick={() => {
              setError(null);
              setPage(0);
            }}
            icon={<span>↻</span>}
          />
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 justify-between">
        <div className="flex-1">
          <label className="text-xs text-pp-muted">Search</label>
          <input
            className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Event, IP, browser, correlation id, etc."
          />
        </div>

        <div className="flex gap-3 items-center">
          <div className="min-w-[180px]">
            <label className="text-xs text-pp-muted">Severity</label>
            <select
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="text-xs text-pp-muted">Event type</label>
            <input
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(0);
              }}
              placeholder="e.g. LOGIN_FAILED"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="text-xs text-pp-muted">From</label>
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <div className="flex-1">
          <label className="text-xs text-pp-muted">To</label>
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {!data?.data?.length ? (
        <EmptyState title="No security events" subtitle="Try adjusting filters or wait for new activity." />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-pp-muted">
              Showing{" "}
              <span className="text-pp-text font-semibold">{Math.min(pageSize, data.data.length)}</span> of{" "}
              <span className="text-pp-text font-semibold">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <label className="text-xs text-pp-muted">Sort</label>
                <select
                  className="ml-2 rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="occurredAt">Time</option>
                  <option value="severity">Severity</option>
                  <option value="eventType">Event</option>
                  <option value="username">Username</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-pp-muted">Direction</label>
                <select
                  className="ml-2 rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
                  value={sortDir}
                  onChange={(e) => {
                    setSortDir(e.target.value as SortDir);
                    setPage(0);
                  }}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full border border-pp-border bg-white/5 rounded-2xl overflow-hidden">
              <thead className="bg-white/5 text-xs text-pp-muted">
                <tr>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Time</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Event</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Username</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Severity</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">IP</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Browser</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Correlation</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pp-border/60">
                {data.data.map((row, idx) => (
                  <tr key={`${row.occurredAt}-${idx}`} className="text-sm">
                    <td className="px-4 py-3 border-b border-pp-border/60">{formatDateTime(row.occurredAt)}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.eventType}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.username ?? "—"}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">
                      <Tag tone={severityTone(row.severity) as any}>{row.severity ?? "—"}</Tag>
                    </td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.browser ?? "—"}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.correlationId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-xs text-pp-muted">
              Page <span className="text-pp-text font-semibold">{page + 1}</span> of{" "}
              <span className="text-pp-text font-semibold">{pageCount}</span> • {total} events
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-2xl border border-pp-border bg-white/5 hover:bg-white/7 px-3 py-2 text-xs disabled:opacity-50"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <button
                className="rounded-2xl border border-pp-border bg-white/5 hover:bg-white/7 px-3 py-2 text-xs disabled:opacity-50"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}