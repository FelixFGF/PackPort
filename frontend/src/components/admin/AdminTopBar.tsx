import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconBell, IconChevronDown, IconSearch, IconSpark } from "./AdminTopBarIcons";

export default function AdminTopBar({
  breadcrumbs,
  onSearch,
}: {
  breadcrumbs?: React.ReactNode;
  onSearch?: (value: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const title = useMemo(() => {
    // Small fallback: use path segment as title
    const parts = location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "welcome";
    return last
      .replaceAll("-", " ")
      .replace(/^\w/, (c) => c.toUpperCase());
  }, [location.pathname]);

  return (
    <div className="border-b border-pp-border bg-pp-bg/35 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-pp-border flex items-center justify-center text-pp-muted">
                <IconSpark className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-semibold text-pp-text truncate">{title}</div>
                {breadcrumbs ? <div className="mt-0.5">{breadcrumbs}</div> : null}
              </div>
            </div>
          </div>

          <div className="flex-1 hidden md:block" />

          <div className="flex items-center gap-2">
            <div className="relative w-[240px] max-w-[40vw] hidden sm:block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pp-muted">
                <IconSearch className="h-4 w-4" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch?.(query);
                }}
                placeholder="Search…"
                className="w-full rounded-xl bg-white/5 border border-pp-border pl-9 pr-3 py-2 text-sm outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <button
              type="button"
              className="relative rounded-xl p-2 hover:bg-white/5 border border-pp-border transition-colors"
              aria-label="Notifications"
              onClick={() => {
                // placeholder behavior (no routing changes)
              }}
            >
              <IconBell className="h-5 w-5 text-pp-muted" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-rose-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl p-2 hover:bg-white/5 border border-pp-border transition-colors"
                aria-label="Admin profile menu"
                onClick={() => setOpenMenu((v) => !v)}
              >
                <div className="h-8 w-8 rounded-xl bg-white/5 border border-pp-border flex items-center justify-center text-pp-muted">
                  <span className="text-sm font-semibold">A</span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-pp-text">Admin</span>
                <IconChevronDown className="h-4 w-4 text-pp-muted" />
              </button>

              {openMenu ? (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-pp-border bg-pp-bg/90 backdrop-blur-xl shadow-2xl overflow-hidden z-30">
                  <div className="p-3 border-b border-pp-border">
                    <div className="text-sm font-semibold text-pp-text">Admin</div>
                    <div className="text-xs text-pp-muted mt-0.5">Signed in</div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm text-pp-text"
                      onClick={() => {
                        navigate("/admin/dashboard/welcome");
                        setOpenMenu(false);
                      }}
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm text-pp-text"
                      onClick={() => {
                        navigate("/admin/dashboard/settings");
                        setOpenMenu(false);
                      }}
                    >
                      Settings
                    </button>

                    <div className="h-px bg-pp-border my-2" />

                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm text-rose-200"
                      onClick={() => {
                        // preserve existing auth behavior; no endpoint assumed here
                        setOpenMenu(false);
                      }}
                    >
                      Sign out (handled by backend)
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-pp-border">
        <div className="px-4 py-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pp-muted">
              <IconSearch className="h-4 w-4" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch?.(query);
              }}
              placeholder="Search…"
              className="w-full rounded-xl bg-white/5 border border-pp-border pl-9 pr-3 py-2 text-sm outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}