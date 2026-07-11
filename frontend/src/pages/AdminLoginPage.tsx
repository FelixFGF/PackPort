import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO, type SeoPageConfig } from "../components/SEO";
import { API_BASE } from "../config/api";

const SEO_CONFIG: SeoPageConfig = {
  title: "Login (ADMIN)",
  description: "PackPort ADMIN login.",
  canonicalPath: "/admin",
};

function EyeIcon({ visible }: { visible: boolean }) {
  // Inline SVG to avoid assumptions about the project's icon library.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={visible ? "text-amber-200" : "text-zinc-300"}
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
          <path d="M4 4l16 16" />
        </>
      )}
    </svg>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Login (ADMIN)";
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <SEO config={SEO_CONFIG} />

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center gap-3">
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

        <h1 className="mt-6 text-3xl font-extrabold text-zinc-50">
          Admin Login
        </h1>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(239,68,68,0.10)]">
              <span className="text-lg">🔒</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-100">
                Restricted area
              </div>
              <div className="mt-1 text-sm leading-relaxed text-zinc-300/90">
                Sign in to access the admin dashboard.
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
              <div className="text-sm font-semibold text-red-100">
                {errorMessage}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-lg">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMessage(null);
              setIsSubmitting(true);

              try {
                const res = await fetch(`${API_BASE}/api/admin/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ username, password }),
                });

                if (!res.ok) {
                  // TEMP debugging: log full response body
                  const maybeBody = await res
                    .json()
                    .catch(() => null as unknown);
                  console.log("[AdminLogin] login failed response body:", maybeBody);

                  const message =
                    typeof maybeBody === "object" && maybeBody !== null
                      ? (maybeBody as any)?.message ?? "Invalid username or password."
                      : "Invalid username or password.";

                  setErrorMessage(message);
                  return;
                }

                navigate("/admin/dashboard", { replace: true });
              } catch {
                setErrorMessage("Invalid username or password.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200">
                  Username
                </label>
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
                <label className="block text-sm font-medium text-zinc-200">
                  Password
                </label>

                <div className="relative mt-1">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 pr-12 text-sm text-zinc-50 ring-1 ring-white/10 outline-none placeholder:text-zinc-500"
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 flex items-center justify-center rounded-xl px-2 text-zinc-300 hover:bg-white/5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400/15 px-4 py-2.5 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-300/30 transition hover:bg-cyan-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}