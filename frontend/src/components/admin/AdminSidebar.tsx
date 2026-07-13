import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconActivity,
  IconAnalytics,
  IconAlert,
  IconHome,
  IconLog,
  IconMonitor,
  IconPackage,
  IconShield,
  IconSettings,
  IconUser,
} from "./AdminSidebarIcons";
import { AdminLogo } from "../../layouts/AdminLayout";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const items = useMemo<NavItem[]>(
    () => [
      { label: "Welcome", path: "/admin/dashboard/welcome", icon: <IconHome className="h-5 w-5" /> },
      { label: "Analytics", path: "/admin/dashboard/analytics", icon: <IconAnalytics className="h-5 w-5" /> },
      { label: "Error Reports", path: "/admin/dashboard/errors", icon: <IconAlert className="h-5 w-5" /> },
      { label: "Logs", path: "/admin/dashboard/logs", icon: <IconLog className="h-5 w-5" /> },
      { label: "Conversions", path: "/admin/dashboard/conversions", icon: <IconPackage className="h-5 w-5" /> },
      { label: "Live Activity", path: "/admin/dashboard/activity", icon: <IconActivity className="h-5 w-5" /> },
      { label: "Admin Activity", path: "/admin/dashboard/activity", icon: <IconMonitor className="h-5 w-5" /> },
      { label: "System", path: "/admin/dashboard/system", icon: <IconMonitor className="h-5 w-5" /> },
      { label: "Security", path: "/admin/dashboard/security", icon: <IconShield className="h-5 w-5" /> },
      { label: "Settings", path: "/admin/dashboard/settings", icon: <IconSettings className="h-5 w-5" /> },
    ],
    []
  );

  return (
    <aside
      className={[
        "h-[calc(100dvh-0px)] sticky top-0 shrink-0 border-r border-pp-border bg-pp-bg/70 backdrop-blur-xl",
        collapsed ? "w-[74px]" : "w-[280px]",
      ].join(" ")}
    >
      <div className="h-full flex flex-col">
        <div className="px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AdminLogo className={collapsed ? "h-8 w-auto" : "h-10 w-auto"} />
            {!collapsed ? (
              <div className="min-w-0">
                <div className="text-sm font-semibold text-pp-text truncate">PackPort</div>
                <div className="text-xs text-pp-muted truncate">Admin Console</div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-2 hover:bg-white/5 transition-colors text-pp-muted"
            onClick={() => setCollapsed((v) => !v)}
          >
            <span className="text-[12px] font-semibold">{collapsed ? ">" : "<"}</span>
          </button>
        </div>

        <nav className="flex-1 overflow-auto px-2 pb-3">
          <div className="px-2 mb-3">{!collapsed ? <div className="text-[11px] uppercase tracking-wider text-pp-muted-2">Navigation</div> : null}</div>
          <ul className="space-y-1">
            {items.map((it) => {
              const isActive = location.pathname === it.path;
              return (
                <li key={it.path}>
                  <Link
                    to={it.path}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors border border-transparent",
                      isActive ? "bg-white/7 border-white/10" : "hover:bg-white/5",
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? it.label : undefined}
                  >
                    <span className="text-pp-muted group-hover:text-white">{it.icon}</span>
                    {!collapsed ? <span className="text-pp-text font-medium">{it.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-pp-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-pp-border flex items-center justify-center text-pp-muted">
              <IconUser className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Admin</div>
                <div className="text-xs text-pp-muted truncate">Signed in</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}