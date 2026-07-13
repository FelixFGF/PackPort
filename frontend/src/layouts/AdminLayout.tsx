import React from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopBar from "../components/admin/AdminTopBar";
import { AdminBreadcrumbs, BreadcrumbItem } from "../components/admin/AdminBreadcrumbs";
import AdminQuickActions from "../components/admin/AdminQuickActions";

type Props = {
  children: React.ReactNode;
};

function defaultBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Home", to: "/" }];
  if (parts[0] === "admin" && parts[1] === "dashboard") {
    const last = parts[2] ?? "welcome";
    const label = last.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase());
    return [
      { label: "Admin", to: "/admin/dashboard/welcome" },
      { label: label },
    ];
  }
  return [{ label: "Admin", to: "/admin/dashboard/welcome" }];
}

export function AdminLayout({ children }: Props) {
  return (
    <div className="min-h-dvh bg-pp-bg text-pp-text">
      <div className="flex w-full">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="w-full">
          {/* Top bar + breadcrumbs */}
          <AdminLayoutShell>{children}</AdminLayoutShell>

          {/* quick actions live only on welcome page via page content */}
        </div>
      </div>
    </div>
  );
}

/**
 * Keeps layout responsive without changing routing/auth behavior.
 * Uses the browser path to compute breadcrumbs.
 */
function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const breadcrumbs = defaultBreadcrumbs(location.pathname);

  return (
    <div className="min-h-dvh">
      <AdminTopBar breadcrumbs={<AdminBreadcrumbs items={breadcrumbs} />} />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}

export function AdminLogo({ className }: { className?: string }) {
  const src = "/assets/images/packport-dev.png";
  return <img src={src} alt="PackPort DEV" className={className} />;
}