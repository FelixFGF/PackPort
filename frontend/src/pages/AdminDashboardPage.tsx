import React, { useEffect } from "react";
import { SEO, type SeoPageConfig } from "../components/SEO";

const SEO_CONFIG: SeoPageConfig = {
  title: "Dashboard (ADMIN)",
  description: "Authentication required.",
  canonicalPath: "/admin/dashboard",
};

export default function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Authentication required (ADMIN)";
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <SEO config={SEO_CONFIG} />

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* DEV logo (admin branding) */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-cyan-500/20 to-amber-500/20 ring-1 ring-white/10">
            <img
              src="/assets/images/packport-dev.png"
              alt="PackPort DEV"
              className="h-10 w-10"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent" />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-medium text-zinc-200">PackPort</div>
            <div className="text-xs text-zinc-400">ADMIN</div>
          </div>
        </div>

        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
          <div className="text-sm font-semibold text-red-100">
            Authentication required.
          </div>
          <div className="mt-2 text-sm leading-relaxed text-red-200/90">
            This dashboard is protected. Backend authentication will be implemented later.
          </div>
        </div>
      </div>
    </div>
  );
}