import React from "react";
import { Tag } from "../dashboard/DashboardPrimitives";

export type SecurityEventFilters = {
  severity?: string;
  eventType?: string;
  username?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export default function EnterpriseSecurityFilters({
  value,
  onChange,
}: {
  value: SecurityEventFilters;
  onChange: (next: SecurityEventFilters) => void;
}) {
  return (
    <div className="rounded-2xl border border-pp-border bg-white/5 backdrop-blur-xl p-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-pp-muted">Severity</label>
            <select
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={value.severity ?? ""}
              onChange={(e) => onChange({ ...value, severity: e.target.value || undefined })}
            >
              <option value="">All</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-pp-muted">Event Type</label>
            <input
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={value.eventType ?? ""}
              onChange={(e) => onChange({ ...value, eventType: e.target.value || undefined })}
              placeholder="e.g. LOGIN_FAILED"
            />
          </div>

          <div>
            <label className="text-xs text-pp-muted">Username</label>
            <input
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={value.username ?? ""}
              onChange={(e) => onChange({ ...value, username: e.target.value || undefined })}
              placeholder="Search username"
            />
          </div>

          <div>
            <label className="text-xs text-pp-muted">Search</label>
            <input
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={value.search ?? ""}
              onChange={(e) => onChange({ ...value, search: e.target.value || undefined })}
              placeholder="Correl. ID / IP / event details"
            />
          </div>

          <div>
            <label className="text-xs text-pp-muted">From</label>
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={value.startDate ?? ""}
              onChange={(e) => onChange({ ...value, startDate: e.target.value || undefined })}
            />
          </div>

          <div>
            <label className="text-xs text-pp-muted">To</label>
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-pp-border bg-white/5 px-3 py-2 text-sm text-pp-text"
              value={value.endDate ?? ""}
              onChange={(e) => onChange({ ...value, endDate: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {value.severity ? (
          <Tag tone={value.severity === "ERROR" ? "bad" : value.severity === "WARN" ? "warn" : "info"}>
            Severity: {value.severity}
          </Tag>
        ) : null}
        {value.eventType ? <Tag tone="info">Event: {value.eventType}</Tag> : null}
        {value.username ? <Tag tone="info">User: {value.username}</Tag> : null}
      </div>
    </div>
  );
}