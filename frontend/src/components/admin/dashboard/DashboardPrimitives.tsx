import React from "react";

export function DashboardSection({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-pp-border bg-white/5 backdrop-blur-xl shadow-sm">
      <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-pp-border/60">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-pp-text truncate">{title}</h2>
          {subtitle ? <p className="text-xs sm:text-sm text-pp-muted mt-1">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: React.ReactNode;
}) {
  const positive = delta?.startsWith("+");
  return (
    <div className="rounded-2xl border border-pp-border bg-white/5 backdrop-blur-xl shadow-sm p-4 transition-transform duration-150 hover:-translate-y-[1px]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-pp-muted">{label}</div>
          <div className="text-xl sm:text-2xl font-semibold text-pp-text mt-1">{value}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-white/5 border border-pp-border flex items-center justify-center text-pp-muted">
          {icon}
        </div>
      </div>

      {delta ? (
        <div className="mt-3 text-xs">
          <span className={positive ? "text-emerald-300" : "text-rose-300"}>{delta}</span>
          <span className="text-pp-muted ml-1">vs last 24h</span>
        </div>
      ) : null}
    </div>
  );
}

export function ButtonPill({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-pp-border bg-white/5 hover:bg-white/7 transition-colors px-3 py-2 text-xs sm:text-sm text-pp-text"
    >
      {icon ? <span className="text-pp-muted">{icon}</span> : null}
      {label}
    </button>
  );
}

export function PlaceholderChart({
  label,
  height = 220,
  variant = "line",
}: {
  label: string;
  height?: number;
  variant?: "line" | "bar" | "donut";
}) {
  // Pure placeholder (no chart lib). Styled for “enterprise” look.
  return (
    <div className="rounded-2xl border border-pp-border bg-white/5 p-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-pp-muted">{label}</div>
          <div className="text-sm sm:text-base font-semibold text-pp-text mt-1">Placeholder data</div>
        </div>
        <div className="text-xs text-pp-muted">Live soon</div>
      </div>

      <div className="mt-4" style={{ height }}>
        <div className="h-full w-full flex items-end gap-2 opacity-90">
          {variant === "line" ? (
            <>
              <div className="flex-1 rounded-xl bg-white/5 border border-pp-border h-1/3 mb-10 animate-pulse" />
              <div className="flex-1 rounded-xl bg-white/5 border border-pp-border h-2/3 mb-6 animate-pulse" />
              <div className="flex-1 rounded-xl bg-white/5 border border-pp-border h-1/2 mb-8 animate-pulse" />
              <div className="flex-1 rounded-xl bg-white/5 border border-pp-border h-3/4 mb-4 animate-pulse" />
              <div className="flex-1 rounded-xl bg-white/5 border border-pp-border h-2/5 mb-9 animate-pulse" />
            </>
          ) : variant === "bar" ? (
            <>
              {[10, 22, 14, 28, 18, 34, 26].map((n, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-xl bg-white/5 border border-pp-border animate-pulse"
                  style={{ height: `${n}%` }}
                />
              ))}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border border-pp-border bg-white/5 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-pp-border bg-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-36 rounded bg-white/5 border border-pp-border animate-pulse" />
        <div className="h-6 w-16 rounded bg-white/5 border border-pp-border animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 rounded bg-white/5 border border-pp-border animate-pulse"
            style={{ width: idx === 0 ? "90%" : idx === 1 ? "70%" : "55%" }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-pp-border bg-white/5 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-white/5 border border-pp-border flex items-center justify-center text-pp-muted">
        <span className="text-lg">⌁</span>
      </div>
      <div className="mt-4 font-semibold text-pp-text">{title}</div>
      {subtitle ? <div className="text-sm text-pp-muted mt-1">{subtitle}</div> : null}
      {action ? <div className="mt-5 flex items-center justify-center">{action}</div> : null}
    </div>
  );
}

export function Tag({ tone, children }: { tone: "ok" | "warn" | "bad" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
      : tone === "warn"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
      : tone === "bad"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/20"
      : "bg-sky-500/15 text-sky-300 border-sky-500/20";

  return (
    <span className={`inline-flex items-center rounded-2xl border px-2.5 py-1 text-[11px] ${cls}`}>
      {children}
    </span>
  );
}

export function ListTable({
  columns,
  rows,
  empty,
}: {
  columns: Array<{ key: string; label: string; className?: string }>;
  rows: Array<Record<string, React.ReactNode>>;
  empty?: React.ReactNode;
}) {
  if (!rows.length) return empty ?? <EmptyState title="No data available" subtitle="Try again later." />;

  return (
    <div className="overflow-hidden rounded-2xl border border-pp-border bg-white/5">
      <div className="grid grid-cols-12 gap-0 border-b border-pp-border/60 bg-white/5 px-4 py-3 text-xs text-pp-muted">
        {columns.map((c) => (
          <div key={c.key} className={`col-span-3 ${c.className ?? ""} truncate`}>
            {c.label}
          </div>
        ))}
      </div>
      <div className="divide-y divide-pp-border/60">
        {rows.map((r, idx) => (
          <div key={idx} className="grid grid-cols-12 px-4 py-3 text-sm items-center">
            {columns.map((c) => (
              <div key={c.key} className={`col-span-3 ${c.className ?? ""} truncate`}>
                {r[c.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}