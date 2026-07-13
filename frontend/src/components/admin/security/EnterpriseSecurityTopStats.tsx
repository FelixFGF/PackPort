import React from "react";
import { StatCard } from "../dashboard/DashboardPrimitives";
import type { SecurityStatisticsDto } from "../../../api/adminSecurity";

export default function EnterpriseSecurityTopStats({ stats }: { stats: SecurityStatisticsDto }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Sessions"
        value={String(stats.activeSessions ?? 0)}
        icon={<span className="text-pp-muted">⎈</span>}
      />
      <StatCard
        label="Failed Logins (24h)"
        value={String(stats.failedLogins ?? 0)}
        icon={<span className="text-pp-muted">⚠</span>}
        delta={"+0"}
      />
      <StatCard
        label="Locked Accounts"
        value={String(stats.lockedAccounts ?? 0)}
        icon={<span className="text-pp-muted">⛔</span>}
        delta={"+0"}
      />
      <StatCard
        label="Security Events Today"
        value={String(stats.securityEventsToday ?? 0)}
        icon={<span className="text-pp-muted">✦</span>}
      />
    </div>
  );
}