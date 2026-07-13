export type SecurityEventRow = {
  eventType: string;
  severity: string;
  username: string | null;
  ipAddress: string | null;
  browser: string | null;
  correlationId: string | null;
  occurredAt: string;
  details: string | null;
};

export type ActiveSessionRow = {
  sessionId: string;
  username: string | null;
  loginTime: string;
  lastActivity: string;
  ipAddress: string | null;
  browser: string | null;
  operatingSystem: string | null;
  active: boolean | null;
  correlationId: string | null;
};

export type SecurityStatisticsDto = {
  activeSessions: number;
  failedLogins: number;
  lockedAccounts: number;
  securityEventsToday: number;
  successfulLogins?: number;
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

type SortDir = "asc" | "desc";

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

const API_BASE = "/api/admin/security";

export async function fetchSecurityStatistics(): Promise<SecurityStatisticsDto> {
  const res = await fetch(`${API_BASE}/statistics`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load security statistics (${res.status})`);
  return res.json();
}

export async function fetchSecurityEvents(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: SortDir;
  search?: string;
  severity?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PagedResponse<SecurityEventRow>> {
  const res = await fetch(
    `${API_BASE}/events${qs({
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      search: params.search,
      severity: params.severity,
      eventType: params.eventType,
      // backend currently may ignore these, but harmless if sent
      startDate: params.startDate,
      endDate: params.endDate,
    })}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error(`Failed to load security events (${res.status})`);
  return res.json();
}

export async function fetchActiveSessions(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: SortDir;
  search?: string;
}): Promise<PagedResponse<ActiveSessionRow>> {
  const res = await fetch(
    `${API_BASE}/sessions${qs({
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      search: params.search,
    })}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error(`Failed to load active sessions (${res.status})`);
  return res.json();
}

export async function terminateSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to terminate session (${res.status})`);
}