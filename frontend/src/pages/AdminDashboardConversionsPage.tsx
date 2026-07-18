import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { fetchAdminConversions, ConversionRow } from "../api/adminConversions";
import { ButtonPill, EmptyState, LoadingSkeleton, Tag } from "../components/admin/dashboard/DashboardPrimitives";

export default function AdminDashboardConversionsPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "STARTED" | "FINISHED" | "FAILED">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<ConversionRow[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminConversions({
        page,
        pageSize,
        search: search.trim() ? search.trim() : undefined,
        status: status || undefined,
      });

      const data = (res as any).content ?? (res as any).data ?? [];
      const t = (res as any).totalElements ?? (res as any).total ?? 0;

      setRows(data);
      setTotal(t);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load conversions.");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const statusTag = (s?: string) => {
    const v = (s ?? "").toUpperCase();
    if (v === "FAILED") return <Tag tone="bad">FAILED</Tag>;
    if (v === "FINISHED") return <Tag tone="ok">FINISHED</Tag>;
    if (v === "STARTED") return <Tag tone="info">STARTED</Tag>;
    return <Tag tone="warn">UNKNOWN</Tag>;
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return "—";
    if (ms < 1000) return `${ms}ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const min = sec / 60;
    return `${min.toFixed(1)}m`;
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-pp-text">Conversions</h1>
            <p className="text-sm text-pp-muted mt-1">Conversion history from live persisted analytics.</p>
          </div>

          <div className="flex items-center gap-2">
            <ButtonPill
              label="Refresh"
              onClick={() => {
                load();
              }}
              icon={"⟳"}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-pp-border bg-white/5 backdrop-blur-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-pp-muted mb-1">Search</label>
              <input
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                placeholder="Job ID, modpack name, Minecraft version..."
                className="w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text outline-none focus:border-pp-border/80"
              />
            </div>

            <div className="w-full lg:w-56">
              <label className="block text-xs text-pp-muted mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value as any);
                }}
                className="w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text outline-none focus:border-pp-border/80"
              >
                <option value="">All</option>
                <option value="STARTED">STARTED</option>
                <option value="FINISHED">FINISHED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="w-full lg:w-auto flex gap-2">
              <ButtonPill
                label="Reset"
                icon="↺"
                onClick={() => {
                  setPage(0);
                  setSearch("");
                  setStatus("");
                }}
              />
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <LoadingSkeleton lines={6} />
          ) : error ? (
            <EmptyState
              title="Could not load conversions"
              subtitle={error}
              action={<ButtonPill label="Try again" icon="⟳" onClick={load} />}
            />
          ) : rows.length === 0 ? (
            <EmptyState title="No conversions found" subtitle="Try adjusting filters or search." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-pp-border bg-white/5">
              <div className="grid grid-cols-12 gap-0 border-b border-pp-border/60 bg-white/5 px-4 py-3 text-xs text-pp-muted">
                <div className="col-span-3">Timestamp</div>
                <div className="col-span-3">Modpack name</div>
                <div className="col-span-2">Source → Target</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Duration</div>
              </div>

              <div className="divide-y divide-pp-border/60">
                {rows.map((r, idx) => {
                  const ts = r.timestampUtc ? new Date(r.timestampUtc).toLocaleString() : "—";
                  const mp = r.modpackName ?? "—";
                  const src = r.loader ?? "—";
                  const tgt = r.operatingSystem ?? "—";

                  return (
                    <div
                      key={`${r.jobId ?? "row"}-${idx}`}
                      className="grid grid-cols-12 px-4 py-3 items-center text-sm"
                    >
                      <div className="col-span-3 truncate">{ts}</div>
                      <div className="col-span-3 truncate">{mp}</div>
                      <div className="col-span-2 truncate">
                        {src} → {tgt}
                      </div>
                      <div className="col-span-2">{statusTag(r.status)}</div>
                      <div className="col-span-2 truncate">{formatDuration(r.conversionDurationMs)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-pp-muted">
            Showing page <span className="text-pp-text font-semibold">{page + 1}</span> of{" "}
            <span className="text-pp-text font-semibold">{totalPages}</span> • Total{" "}
            <span className="text-pp-text font-semibold">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <ButtonPill label="Prev" icon="←" onClick={() => setPage((p) => Math.max(0, p - 1))} />
            <ButtonPill label="Next" icon="→" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}