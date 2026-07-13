import React from "react";
import { Link } from "react-router-dom";
import { IconActivity, IconAnalytics, IconAlert, IconLog, IconPackage, IconShield } from "./AdminQuickActionsIcons";
import { AdminLogo } from "../../layouts/AdminLayout";

const actions: Array<{ label: string; to: string; icon: React.ReactNode; desc: string }> = [
  { label: "Run Conversion", to: "/admin/dashboard/conversions", icon: <IconPackage className="h-5 w-5" />, desc: "View conversion history and status." },
  { label: "Analytics", to: "/admin/dashboard/analytics", icon: <IconAnalytics className="h-5 w-5" />, desc: "Visitors, conversions & performance metrics." },
  { label: "Error Reports", to: "/admin/dashboard/errors", icon: <IconAlert className="h-5 w-5" />, desc: "Failures and stack traces sent by admins." },
  { label: "Live Activity", to: "/admin/dashboard/activity", icon: <IconActivity className="h-5 w-5" />, desc: "Queued/running conversions and activity stream." },
  { label: "Server Logs", to: "/admin/dashboard/logs", icon: <IconLog className="h-5 w-5" />, desc: "Search logs by level and keyword." },
  { label: "Security", to: "/admin/dashboard/security", icon: <IconShield className="h-5 w-5" />, desc: "Sessions and brute force protections." },
];

export default function AdminQuickActions() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-pp-text">Quick Actions</h2>
          <div className="text-xs text-pp-muted mt-1">Jump to the most used admin tools.</div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-pp-muted text-xs">
          <AdminLogo className="h-7 w-auto opacity-90" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group rounded-2xl border border-pp-border bg-white/5 hover:bg-white/7 transition-colors p-4 flex gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-pp-border flex items-center justify-center text-pp-muted group-hover:text-white transition-colors">
              {a.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-pp-text truncate">{a.label}</div>
              <div className="text-xs text-pp-muted mt-1 line-clamp-2">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}