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
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
          <div className="text-sm font-semibold text-red-100">Authentication required.</div>
          <div className="mt-2 text-sm leading-relaxed text-red-200/90">
            This dashboard is protected. Backend authentication will be implemented later.
          </div>
        </div>
      </div>
    </div>
  );
}