import React, { useEffect, useMemo, useState } from "react";
import EnterpriseSecurityTopStats from "../components/admin/security/EnterpriseSecurityTopStats";
import EnterpriseActiveSessionsTable from "../components/admin/security/EnterpriseActiveSessionsTable";
import EnterpriseSecurityFilters, {
  type SecurityEventFilters,
} from "../components/admin/security/EnterpriseSecurityFilters";
import EnterpriseSecurityEventsTable from "../components/admin/security/EnterpriseSecurityEventsTable";
import { fetchSecurityStatistics, type SecurityStatisticsDto } from "../api/adminSecurity";

export default function AdminDashboardSecurityPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState<SecurityEventFilters>({
    severity: undefined,
    eventType: undefined,
    username: undefined,
    search: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const [stats, setStats] = useState<SecurityStatisticsDto | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    const id = window.setInterval(() => setRefreshKey((k) => k + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  // Fetch stats on refreshKey so cards update, but keep filters untouched.
  useEffect(() => {
    let mounted = true;
    setStatsLoading(true);
    setStatsError(null);

    fetchSecurityStatistics()
      .then((s) => {
        if (!mounted) return;
        setStats(s);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setStatsError(e?.message ?? "Failed to load security statistics");
      })
      .finally(() => {
        if (!mounted) return;
        setStatsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const initialFilters = useMemo(() => {
    return {
      search: filters.search ?? "",
      severity: filters.severity ?? "ALL",
      eventType: filters.eventType ?? "",
      username: filters.username ?? "",
      startDate: filters.startDate ?? "",
      endDate: filters.endDate ?? "",
    };
  }, [filters]);

  return (
    <div className="space-y-6">
      <div>
        {statsError ? (
          <div className="rounded-3xl border border-pp-border bg-pp-panel/60 backdrop-blur-xl p-5">
            <div className="text-sm font-semibold text-pp-text">Security Overview</div>
            <div className="text-xs text-pp-muted mt-1">{statsError}</div>
          </div>
        ) : statsLoading || !stats ? (
          <div className="rounded-3xl border border-pp-border bg-pp-panel/60 backdrop-blur-xl p-5">
            <div className="text-sm font-semibold text-pp-text">Security Overview</div>
            <div className="text-xs text-pp-muted mt-1">Loading...</div>
          </div>
        ) : (
          <EnterpriseSecurityTopStats stats={stats} />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-pp-border bg-pp-panel/60 backdrop-blur-xl p-5">
            <div className="text-sm font-semibold text-pp-text">Security Events</div>
            <div className="text-xs text-pp-muted mt-1">
              Search, filter, sort, and investigate security activity.
            </div>

            <div className="mt-4">
              <EnterpriseSecurityFilters value={filters} onChange={setFilters} />
            </div>

            <div className="mt-4">
              <EnterpriseSecurityEventsTable refreshKey={refreshKey} initialFilters={initialFilters} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="rounded-3xl border border-pp-border bg-pp-panel/60 backdrop-blur-xl p-5">
            <div className="text-sm font-semibold text-pp-text">Active Sessions</div>
            <div className="text-xs text-pp-muted mt-1">View and terminate active admin sessions.</div>

            <div className="mt-4">
              <EnterpriseActiveSessionsTable refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}