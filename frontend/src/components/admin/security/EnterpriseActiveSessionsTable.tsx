import React, { useMemo, useState } from "react";
import { EmptyState, LoadingSkeleton, ButtonPill, Tag } from "../dashboard/DashboardPrimitives";
import { fetchActiveSessions, terminateSession } from "../../../api/adminSecurity";
import type { ActiveSessionRow, PagedResponse } from "../../../api/adminSecurity";

type SortDir = "asc" | "desc";

function formatDateTime(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function toneForSessionStatus(s: ActiveSessionRow) {
  // Backend doesn't send explicit status; keep "active" if present.
  const active = s.active ?? true;
  return active ? "ok" : "warn";
}

export default function EnterpriseActiveSessionsTable({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("lastActivity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState<string>("");

  const [data, setData] = useState<PagedResponse<ActiveSessionRow> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingTerminateId, setPendingTerminateId] = useState<string | null>(null);
  const [terminateLoading, setTerminateLoading] = useState(false);

  const queryKey = useMemo(() => {
    return { page, pageSize, sortBy, sortDir, search, refreshKey };
  }, [page, pageSize, sortBy, sortDir, search, refreshKey]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchActiveSessions({
      page: queryKey.page,
      pageSize: queryKey.pageSize,
      sortBy: queryKey.sortBy,
      sortDir: queryKey.sortDir,
      search: queryKey.search || undefined,
    })
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load active sessions");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [queryKey]);

  async function onTerminate(sessionId: string) {
    setTerminateLoading(true);
    try {
      await terminateSession(sessionId);
      // After termination, rely on next refreshKey tick. Also trigger immediate re-fetch by bumping state.
      setPendingTerminateId(null);
      setPage((p) => p); // no-op; keeps pagination
    } catch (e: any) {
      setError(e?.message ?? "Failed to terminate session");
    } finally {
      setTerminateLoading(false);
    }
  }

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (loading && !data) {
    return <LoadingSkeleton lines={6} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Security sessions unavailable"
        subtitle={error}
        action={
          <ButtonPill
            label="Retry"
            onClick={() => {
              setError(null);
              // Next refreshKey tick will reload; keep as retry by resetting page.
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
            placeholder="Username / session id / IP / browser"
          />
        </div>
        <div className="flex items-center gap-2">
          <div>
            <label className="text-xs text-pp-muted">Sort</label>
            <select
              className="mt-1 rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
            >
              <option value="lastActivity">Last Activity</option>
              <option value="loginTime">Login Time</option>
              <option value="username">Username</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-pp-muted">Direction</label>
            <select
              className="mt-1 rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
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

      {!data?.data?.length ? (
        <EmptyState
          title="No active sessions"
          subtitle="There are currently no active admin sessions to display."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border border-pp-border bg-white/5 rounded-2xl overflow-hidden">
              <thead className="bg-white/5 text-xs text-pp-muted">
                <tr>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Username</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Login Time</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Last Activity</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">IP Address</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Browser</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Operating System</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Status</th>
                  <th className="text-left px-4 py-3 border-b border-pp-border/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border/60">
                {data.data.map((row) => (
                  <tr key={row.sessionId} className="text-sm">
                    <td className="px-4 py-3 border-b border-pp-border/60">
                      <div className="truncate max-w-[220px]">{row.username ?? "—"}</div>
                      <div className="text-xs text-pp-muted mt-1 truncate max-w-[220px]">{row.sessionId}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{formatDateTime(row.loginTime)}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{formatDateTime(row.lastActivity)}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.browser ?? "—"}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">{row.operatingSystem ?? "—"}</td>
                    <td className="px-4 py-3 border-b border-pp-border/60">
                      <Tag tone={toneForSessionStatus(row) as any}>{(row.active ?? true) ? "Active" : "Inactive"}</Tag>
                    </td>
                    <td className="px-4 py-3 border-b border-pp-border/60">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-2xl border border-pp-border bg-white/5 hover:bg-white/7 px-3 py-2 text-xs text-pp-text transition-colors disabled:opacity-50"
                          disabled={terminateLoading}
                          onClick={() => setPendingTerminateId(row.sessionId)}
                        >
                          Terminate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-xs text-pp-muted">
              Page <span className="text-pp-text font-semibold">{page + 1}</span> of{" "}
              <span className="text-pp-text font-semibold">{pageCount}</span> • {total} sessions
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

      {pendingTerminateId ? (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-pp-border bg-pp-panel/95 backdrop-blur-xl shadow-xl p-5">
            <div className="text-sm font-semibold text-pp-text">Terminate Session?</div>
            <div className="mt-2 text-sm text-pp-muted">
              This will immediately revoke the active admin session.
            </div>
            <div className="mt-4 rounded-2xl border border-pp-border bg-white/5 p-3">
              <div className="text-xs text-pp-muted">Session ID</div>
              <div className="text-sm text-pp-text break-all">{pendingTerminateId}</div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-2xl border border-pp-border bg-white/5 hover:bg-white/7 px-3 py-2 text-sm"
                onClick={() => setPendingTerminateId(null)}
                disabled={terminateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 px-3 py-2 text-sm text-rose-200 disabled:opacity-50"
                onClick={() => onTerminate(pendingTerminateId)}
                disabled={terminateLoading}
              >
                {terminateLoading ? "Terminating..." : "Terminate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}