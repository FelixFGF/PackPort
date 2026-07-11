import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO, type SeoPageConfig } from "../components/SEO";

const SEO_CONFIG: SeoPageConfig = {
  title: "Login (ADMIN)",
  description: "PackPort ADMIN login.",
  canonicalPath: "/admin",
};

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Login (ADMIN)";
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <SEO config={SEO_CONFIG} />

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-cyan-500/20 to-amber-500/20 ring-1 ring-white/10">
            <img src="/assets/images/packport-logo.png" alt="PackPort" className="h-10 w-10" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-zinc-200">PackPort</div>
            <div className="text-xs text-zinc-400">ADMIN</div>
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-zinc-50">Admin Login</h1>

        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-red-400/25 bg-red-500/10 shadow-[0_0_24px_rgba(239,68,68,0.25)]">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-red-100">Authentication required</div>
              <div className="mt-1 text-sm leading-relaxed text-red-200/90">
                This area is restricted. Do not share admin credentials.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Do not implement fake login yet:
              // keep the dashboard protected until backend authentication is implemented.
              navigate("/admin/dashboard", { replace: true });
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-zinc-50 ring-1 ring-white/10 outline-none placeholder:text-zinc-500"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-zinc-50 ring-1 ring-white/10 outline-none placeholder:text-zinc-500"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400/15 px-4 py-2.5 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-300/30 transition hover:bg-cyan-400/20"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}