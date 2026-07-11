import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SEO, type SeoPageConfig } from "../components/SEO";
import { API_BASE } from "../config/api";

const SEO_CONFIG: SeoPageConfig = {
  title: "Dashboard (ADMIN)",
  description: "Admin dashboard.",
  canonicalPath: "/admin/dashboard",
};

type AdminSessionResponse = { authenticated: boolean };

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Dashboard (ADMIN)";

    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/session`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        // Only redirect when backend explicitly reports authenticated=false.
        // On network/HTTP errors, keep the dashboard visible (no bouncing to "/").
        if (!res.ok) {
          setIsAuthenticated(null);
          return;
        }

        const data: AdminSessionResponse = await res.json();

        if (data && typeof data.authenticated === "boolean") {
          setIsAuthenticated(data.authenticated);
        } else {
          setIsAuthenticated(null);
        }
      } catch {
        // On fetch failure, do NOT redirect.
        setIsAuthenticated(null);
      }
    };

    run();
  }, []);

  if (isAuthenticated === false) {
    return <Navigate to="/" replace />;
  }

  // While checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <div className="text-sm text-zinc-400">Checking admin session…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <SEO config={SEO_CONFIG} />

      <div className="mx-auto max-w-2xl px-4 py-10">
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

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-zinc-200">Admin authenticated</div>
          <div className="mt-2 text-sm leading-relaxed text-zinc-400">
            Session verified. Future admin features can be added here.
          </div>
        </div>
      </div>
    </div>
  );
}