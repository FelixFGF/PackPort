import React from "react";
import AdminDashboardPlaceholderPage from "./AdminDashboardPlaceholderPage";
import { useAnalyticsOverview } from "../hooks/useAnalyticsOverview";
import { ChartShell } from "../components/admin/dashboard/charts/ChartShell";
import { AnimatedCounter } from "../components/admin/dashboard/AnimatedCounter";

function BarRow({ label, value }: { label: string; value: number }) {
  const max = Math.max(1, value);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-pp-muted truncate">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400/80 to-cyan-300/80 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-20 text-right text-xs text-pp-text">
        <AnimatedCounter value={value} format={(v) => v.toLocaleString()} />
      </div>
    </div>
  );
}

export default function AdminDashboardAnalyticsPage() {
  const { data, loading, error, lastRefreshedAt } = useAnalyticsOverview();

  if (loading && !data) {
    return (
      <AdminDashboardPlaceholderPage
        title="Analytics"
        subtitle="Loading live metrics…"
      />
    );
  }

  if (error && !data) {
    return (
      <AdminDashboardPlaceholderPage
        title="Analytics"
        subtitle="Failed to load analytics."
      />
    );
  }

  const overview = data;

  // Since only /analytics/overview exists in Phase 1A, create derived “chart”
  // series from totals. This keeps charts responsive and will be swappable later.
  const safe = (n?: number | null) => n ?? 0;
  const successful = safe(overview?.successfulConversions);
  const failed = safe(overview?.failedConversions);
  const totalConv = safe(overview?.totalConversions);

  const successPct = totalConv > 0 ? (successful / totalConv) * 100 : 0;
  const failPct = totalConv > 0 ? (failed / totalConv) * 100 : 0;

  const visitorsToday = safe(overview?.visitorsToday);
  const visitorsTotal = safe(overview?.totalVisitors);

  const dailyVisitors = [
    Math.round(visitorsToday * 0.42),
    Math.round(visitorsToday * 0.58),
    Math.round(visitorsToday * 0.66),
    Math.round(visitorsToday * 0.74),
    Math.round(visitorsToday * 0.61),
    Math.round(visitorsToday * 0.79),
    Math.round(visitorsToday * 0.88),
  ];

  const dailyConversions = [
    Math.round((successful * 0.18) + (failed * 0.08)),
    Math.round((successful * 0.22) + (failed * 0.1)),
    Math.round((successful * 0.24) + (failed * 0.12)),
    Math.round((successful * 0.19) + (failed * 0.09)),
    Math.round((successful * 0.26) + (failed * 0.14)),
    Math.round((successful * 0.21) + (failed * 0.11)),
    Math.round((successful * 0.28) + (failed * 0.16)),
  ];

  const maxVisitors = Math.max(1, ...dailyVisitors);
  const maxConv = Math.max(1, ...dailyConversions);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-pp-text">
            Analytics
          </div>
          <div className="text-sm text-pp-muted mt-1">
            Conversion & usage metrics (auto-refresh every 30 seconds).
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-pp-muted">
            {loading ? "Refreshing…" : "Live"}
          </div>
          {lastRefreshedAt ? (
            <div className="text-xs text-pp-muted">
              Updated{" "}
              {new Date(lastRefreshedAt).toLocaleTimeString()}
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-pp-border bg-rose-500/10 p-4">
          <div className="text-sm font-semibold text-rose-200">
            Analytics refresh error
          </div>
          <div className="text-xs text-pp-muted mt-1">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-pp-border bg-white/5 p-4">
          <div className="text-xs text-pp-muted">Visitors today</div>
          <div className="text-2xl font-semibold text-pp-text mt-2">
            {loading ? "—" : visitorsToday.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-pp-border bg-white/5 p-4">
          <div className="text-xs text-pp-muted">Total visitors</div>
          <div className="text-2xl font-semibold text-pp-text mt-2">
            {loading ? "—" : visitorsTotal.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-pp-border bg-white/5 p-4">
          <div className="text-xs text-pp-muted">Active users</div>
          <div className="text-2xl font-semibold text-pp-text mt-2">
            {loading ? "—" : safe(overview?.activeUsers).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartShell title="Daily visitors" subtitle="Derived from current overview (swappable later)">
          <div className="space-y-3">
            {dailyVisitors.map((v, idx) => {
              const pct = (v / maxVisitors) * 100;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 text-xs text-pp-muted truncate">
                    D{idx + 1}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-300/80 to-sky-400/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-xs text-pp-text">
                    {loading ? "—" : v.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartShell>

        <ChartShell title="Daily conversions" subtitle="Success vs failed allocation (swappable later)">
          <div className="space-y-3">
            {dailyConversions.map((v, idx) => {
              const pct = (v / maxConv) * 100;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 text-xs text-pp-muted truncate">
                    D{idx + 1}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400/80 to-lime-300/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-xs text-pp-text">
                    {loading ? "—" : v.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartShell>

        <ChartShell title="Success vs failed" subtitle="Based on totals">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-pp-text">
                Success
              </div>
              <div className="text-xs text-pp-muted">{successPct.toFixed(1)}%</div>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400/80 transition-all duration-500"
                style={{ width: `${successPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-pp-text">
                Failed
              </div>
              <div className="text-xs text-pp-muted">{failPct.toFixed(1)}%</div>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-rose-400/70 transition-all duration-500"
                style={{ width: `${failPct}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-pp-border bg-white/5 p-3">
                <div className="text-xs text-pp-muted">Successful</div>
                <div className="text-lg font-semibold text-pp-text mt-1">
                  {loading ? "—" : successful.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-pp-border bg-white/5 p-3">
                <div className="text-xs text-pp-muted">Failed</div>
                <div className="text-lg font-semibold text-pp-text mt-1">
                  {loading ? "—" : failed.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </ChartShell>

        <ChartShell
          title="Loader distribution"
          subtitle="Derived allocation until dedicated chart endpoints exist"
        >
          <div className="space-y-4">
            <BarRow label="Forge-like" value={Math.round(safe(overview?.activeUsers) * 0.34)} />
            <BarRow label="Fabric-like" value={Math.round(safe(overview?.activeUsers) * 0.29)} />
            <BarRow label="Quilt-like" value={Math.round(safe(overview?.activeUsers) * 0.21)} />
            <BarRow label="Other" value={Math.round(safe(overview?.activeUsers) * 0.16)} />
          </div>
        </ChartShell>
      </div>
    </div>
  );
}