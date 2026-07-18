import React, { useEffect, useMemo, useState } from "react";
import { EmptyState, LoadingSkeleton, Tag } from "../dashboard/DashboardPrimitives";
import { AdminActivityService, PagedResponse } from "../../../api/adminActivity";
import { AdminActivityDto } from "../../../types/adminActivity";

type FeedType = "ALL" | "LOGIN" | "LOGOUT" | "UPLOAD" | "CONVERT" | "ERROR" | "ACTION";

function safeLower(v?: string | null) {
  return v ? String(v).toLowerCase() : "";
}

function classifyEvent(action?: string | null, description?: string | null): FeedType {
  const a = safeLower(action);
  const d = safeLower(description);
  const hay = `${a} ${d}`.trim();

  if (!hay) return "ACTION";
  if (hay.includes("login")) return "LOGIN";
  if (hay.includes("logout")) return "LOGOUT";
  if (hay.includes("upload") || hay.includes("uploadcontroller")) return "UPLOAD";
  if (hay.includes("convert") || hay.includes("conversion") || hay.includes("conversionstep")) return "CONVERT";
  if (hay.includes("error") || hay.includes("exception") || hay.includes("report_error") || hay.includes("error_report")) return "ERROR";
  return "ACTION";
}

function formatDateTime(v?: string | null): string {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString();
  } catch {
    return v;
  }
}

function typeTag(type: FeedType): { tone: "ok" | "warn" | "bad" | "info"; label: string } {
  switch (type) {
    case "LOGIN":
      return { tone: "ok", label: "LOGIN" };
    case "LOGOUT":
      return { tone: "info", label: "LOGOUT" };
    case "UPLOAD":
      return { tone: "info", label: "UPLOAD" };
    case "CONVERT":
      return { tone: "ok", label: "CONVERSION" };
    case "ERROR":
      return { tone: "bad", label: "ERROR" };
    default:
      return { tone: "warn", label: "ACTION" };
  }
}

function toEventDescription(a: AdminActivityDto): string {
  if (a.description) return a.description;
  return a.action ? String(a.action) : "—";
}

export function LiveActivityFeed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<AdminActivityDto[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(40);

  const [feedType, setFeedType] = useState<FeedType>("ALL");
  const [search, setSearch] = useState("");

  // Polling
  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        setError(null);
        const resp: PagedResponse<AdminActivityDto> = await AdminActivityService.listAdminActivity({
          page,
          size,
        });
        if (!alive) return;

        setEvents(resp.content ?? []);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    }

    poll();
    const interval = window.setInterval(poll, 7000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [page, size]);

  const filtered = useMemo(() => {
    const q = safeLower(search).trim();
    let out = [...events];

    if (feedType !== "ALL") {
      out = out.filter((e) => classifyEvent(e.action, e.description) === feedType);
    }

    if (q) {
      out = out.filter((e) => {
        const hay = [
          e.username,
          e.ipAddress,
          e.browser,
          e.operatingSystem,
          e.action,
          e.description,
          e.sessionId,
        ]
          .map((x) => safeLower(x))
          .join(" | ");
        return hay.includes(q);
      });
    }

    out.sort((a, b) => {
      const at = a.timestampUtc ? Date.parse(String(a.timestampUtc)) : 0;
      const bt = b.timestampUtc ? Date.parse(String(b.timestampUtc)) : 0;
      return bt - at;
    });

    return out;
  }, [events, feedType, search]);

  if (loading) return <LoadingSkeleton lines={8} />;

  if (error) {
    return <EmptyState title="Failed to load activity" subtitle={error} />;
  }

  if (!filtered.length) {
    return <EmptyState title="No activity yet" subtitle="Try adjusting filters or wait for new events." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
        <div className="flex-1">
          <div className="text-xs text-pp-muted mb-1">Search</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="username, ip, action, description..."
            className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
          />
        </div>

        <div className="w-full lg:w-52">
          <div className="text-xs text-pp-muted mb-1">Event type</div>
          <select
            value={feedType}
            onChange={(e) => setFeedType(e.target.value as FeedType)}
            className="w-full rounded-2xl border border-pp-border bg-white/5 px-4 py-2 text-sm text-pp-text outline-none"
          >
            <option value="ALL">All</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="UPLOAD">Uploads</option>
            <option value="CONVERT">Conversions</option>
            <option value="ERROR">Errors</option>
            <option value="ACTION">Admin actions</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pp-border bg-white/5">
        <div className="grid grid-cols-12 gap-0 border-b border-pp-border/60 bg-white/5 px-4 py-3 text-xs text-pp-muted">
          <div className="col-span-2 truncate">Timestamp</div>
          <div className="col-span-2 truncate">Event</div>
          <div className="col-span-3 truncate">User / IP</div>
          <div className="col-span-3 truncate">Related</div>
          <div className="col-span-2 truncate">Status</div>
        </div>

        <div className="divide-y divide-pp-border/60">
          {filtered.slice(0, 60).map((e) => {
            const type = classifyEvent(e.action, e.description);
            const tag = typeTag(type);

            return (
              <div key={String(e.id)} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                <div className="col-span-2 truncate text-pp-muted">{formatDateTime(e.timestampUtc ?? null)}</div>
                <div className="col-span-2 truncate">
                  <Tag tone={tag.tone}>{tag.label}</Tag>
                </div>
                <div className="col-span-3 truncate text-pp-muted">
                  {e.username ? String(e.username) : "—"}
                  {e.ipAddress ? <span className="text-neutral-400 ml-2">({e.ipAddress})</span> : null}
                </div>
                <div className="col-span-3 truncate">
                  {e.description ? String(e.description) : e.action ? String(e.action) : "—"}
                </div>
                <div className="col-span-2 truncate">
                  <Tag tone={type === "ERROR" ? "bad" : "info"}>{type === "ERROR" ? "CHECK" : "OK"}</Tag>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-pp-muted">
        Auto-refreshing every <span className="text-pp-text font-semibold">~7 seconds</span>.
      </div>
    </div>
  );
}