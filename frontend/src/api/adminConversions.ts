export type ConversionRow = {
  jobId?: string;
  timestampUtc?: string;

  modpackName?: string;
  minecraftVersion?: string;

  loader?: string; // "Source platform" equivalent (mod loader)
  operatingSystem?: string; // best-effort

  conversionStarted?: boolean;
  conversionFinished?: boolean;
  conversionFailed?: boolean;

  conversionDurationMs?: number;

  status?: string; // STARTED | FINISHED | FAILED | UNKNOWN
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export async function fetchAdminConversions(params: {
  page: number;
  pageSize: number;
  search?: string;
  modpack?: string;
  loader?: string;
  status?: "STARTED" | "FINISHED" | "FAILED";
  from?: string; // ISO date-time
  to?: string; // ISO date-time
}): Promise<PagedResponse<ConversionRow>> {
  const res = await fetch(`/api/admin/conversions${qs({
    page: params.page,
    size: params.pageSize, // backend uses "size"
    search: params.search,
    modpack: params.modpack,
    loader: params.loader,
    status: params.status,
    from: params.from,
    to: params.to,
  })}`, { credentials: "include" });

  if (!res.ok) throw new Error(`Failed to load conversions (${res.status})`);
  return res.json();
}