import React from "react";
import AdminQuickActions from "../../components/admin/AdminQuickActions";
import {
  EmptyState,
  ListTable,
  LoadingSkeleton,
  PlaceholderChart,
  StatCard,
  Tag,
  DashboardSection,
} from "../../components/admin/dashboard/DashboardPrimitives";
import {
  IconActivity,
  IconAlert,
  IconPackage,
  IconShield,
} from "../../components/admin/AdminIcons";
import { useAnalyticsOverview } from "../../hooks/useAnalyticsOverview";
import { AnimatedCounter } from "../../components/admin/dashboard/AnimatedCounter";

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-pp-text truncate">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-pp-muted mt-1">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function formatInt(n: number) {
  return n.toLocaleString();
}

export default function EnterpriseDashboardWelcome() {
  const { data, loading, error, lastRefreshedAt } = useAnalyticsOverview();

  const stats = [
    {
      label: "Visitors Today",
      value: loading ? "—" : formatInt(data?.visitorsToday ?? 0),
      delta: "",
      icon: <IconActivity className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.visitorsToday}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
    {
      label: "Total Visitors",
      value: loading ? "—" : formatInt(data?.totalVisitors ?? 0),
      delta: "",
      icon: <IconActivity className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.totalVisitors}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
    {
      label: "Active Users",
      value: loading ? "—" : formatInt(data?.activeUsers ?? 0),
      delta: "",
      icon: <IconShield className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.activeUsers}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
    {
      label: "Running Jobs",
      value: loading ? "—" : formatInt(data?.runningJobs ?? 0),
      delta: "",
      icon: <IconActivity className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.runningJobs}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
  ];

  const conversionCards = [
    {
      label: "Total Conversions",
      value: loading ? "—" : formatInt(data?.totalConversions ?? 0),
      icon: <IconPackage className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.totalConversions}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
    {
      label: "Successful",
      value: loading ? "—" : formatInt(data?.successfulConversions ?? 0),
      icon: <IconShield className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.successfulConversions}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
    {
      label: "Failed",
      value: loading ? "—" : formatInt(data?.failedConversions ?? 0),
      icon: <IconAlert className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.failedConversions}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
    {
      label: "Avg Conversion Duration (ms)",
      value: loading ? "—" : formatInt(data?.averageConversionTime ?? 0),
      icon: <IconPackage className="h-5 w-5" />,
      content: data ? (
        <AnimatedCounter
          value={data.averageConversionTime}
          format={(v) => formatInt(v)}
        />
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin Dashboard"
        subtitle="Enterprise analytics — live metrics with auto refresh."
        right={
          <div className="hidden sm:flex items-center gap-2">
            {loading ? (
              <Tag tone="info">Refreshing…</Tag>
            ) : error ? (
              <Tag tone="bad">Analytics unavailable</Tag>
            ) : (
              <Tag tone="ok">
                Updated{" "}
                {lastRefreshedAt
                  ? new Date(lastRefreshedAt).toLocaleTimeString()
                  : "—"}
              </Tag>
            )}
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-pp-border bg-rose-500/10 p-4">
          <div className="text-sm font-semibold text-rose-200">
            Failed to load analytics
          </div>
          <div className="text-xs text-pp-muted mt-1">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delta={s.delta}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {conversionCards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delta={""}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <DashboardSection
            title="Recent Activity"
            subtitle="Latest admin events and conversion steps."
            right={<div className="text-xs text-pp-muted">Last 15 min</div>}
          >
            <LoadingSkeleton lines={3} />
            <div className="mt-4">
              <ListTable
                columns={[
                  { key: "time", label: "Time", className: "col-span-3" },
                  { key: "actor", label: "Actor", className: "col-span-3" },
                  { key: "action", label: "Action", className: "col-span-3" },
                  { key: "status", label: "Status", className: "col-span-3" },
                ]}
                rows={[
                  {
                    time: "10:12",
                    actor: "system",
                    action: "Job step: export",
                    status: <span className="text-emerald-300">DONE</span>,
                  },
                  {
                    time: "10:07",
                    actor: "admin",
                    action: "Re-run conversion",
                    status: <span className="text-amber-300">QUEUED</span>,
                  },
                  {
                    time: "09:58",
                    actor: "system",
                    action: "Manifest parse",
                    status: <span className="text-emerald-300">OK</span>,
                  },
                ]}
              />
            </div>
          </DashboardSection>

          <DashboardSection title="Quick Actions" subtitle="Jump to admin tools.">
            <AdminQuickActions />
          </DashboardSection>
        </div>

        <div className="space-y-4">
          <DashboardSection
            title="System Health"
            subtitle="CPU, memory, job queue, and cache status."
            right={
              <div className="text-xs text-pp-muted">
                {loading ? "Loading…" : "Auto refresh"}
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-pp-border bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-pp-text">
                    Backend online
                  </div>
                  <Tag tone={error ? "bad" : "ok"}>
                    {error ? "Degraded" : "Healthy"}
                  </Tag>
                </div>
                <div className="text-xs text-pp-muted mt-2">
                  Polling{" "}
                  <span className="text-pp-text">
                    /api/admin/analytics/overview
                  </span>{" "}
                  every 30s
                </div>
              </div>

              <div className="rounded-2xl border border-pp-border bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-pp-text">
                    Database connected
                  </div>
                  <Tag tone="info">Via Flyway</Tag>
                </div>
                <div className="text-xs text-pp-muted mt-2">
                  Last refresh:{" "}
                  <span className="text-pp-text">
                    {lastRefreshedAt
                      ? new Date(lastRefreshedAt).toLocaleTimeString()
                      : "—"}
                  </span>
                </div>
              </div>

              <EmptyState
                title="Phase 2 UI"
                subtitle="Cards are now wired to real analytics overview data."
              />
            </div>
          </DashboardSection>

          <DashboardSection
            title="Recent Errors"
            subtitle="Last reported conversion failures."
          >
            <ListTable
              columns={[
                { key: "job", label: "Job", className: "col-span-2" },
                { key: "type", label: "Type", className: "col-span-2" },
                { key: "msg", label: "Message", className: "col-span-4" },
                { key: "lvl", label: "Level", className: "col-span-4" },
              ]}
              rows={[
                {
                  job: "job_8841",
                  type: "manifest",
                  msg: "Missing dependencies",
                  lvl: <span className="text-rose-300">ERROR</span>,
                },
                {
                  job: "job_8810",
                  type: "export",
                  msg: "Modrinth sync timeout",
                  lvl: <span className="text-amber-300">WARN</span>,
                },
              ]}
              empty={<LoadingSkeleton lines={2} />}
            />
          </DashboardSection>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardSection
          title="Conversion Trends"
          subtitle="Chart wiring is prepared (overview-backed)."
        >
          <PlaceholderChart
            label="Conversions per hour"
            height={240}
            variant="line"
          />
        </DashboardSection>

        <DashboardSection
          title="Error Distribution"
          subtitle="Chart wiring is prepared (overview-backed)."
        >
          <PlaceholderChart
            label="Errors by category"
            height={240}
            variant="bar"
          />
        </DashboardSection>
      </div>
    </div>
  );
}