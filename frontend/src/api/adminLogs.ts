import { API_BASE } from "../config/api";
import { ApplicationLogDto } from "../types/applicationLogs";

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page index
  size: number;
};

export class AdminLogsService {
  static async listAdminLogs(params: {
    page: number;
    size: number;
    level?: string;
    logger?: string;
    message?: string;
    jobId?: string;
    requestPath?: string;
    from?: string; // ISO
    to?: string; // ISO
    sort?: "desc" | "asc";
  }): Promise<PagedResponse<ApplicationLogDto>> {
    const url = new URL(`${API_BASE}/admin/logs`);
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("size", String(params.size));
    if (params.level) url.searchParams.set("level", params.level);
    if (params.logger) url.searchParams.set("logger", params.logger);
    if (params.message) url.searchParams.set("message", params.message);
    if (params.jobId) url.searchParams.set("jobId", params.jobId);
    if (params.requestPath) url.searchParams.set("requestPath", params.requestPath);
    if (params.from) url.searchParams.set("from", params.from);
    if (params.to) url.searchParams.set("to", params.to);

    // backend currently sorts by timestampUtc desc; keep UI sorting toggle but still rely on backend default
    // (no API param provided for sorting in controller)

    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load logs (${res.status}): ${text || res.statusText}`);
    }

    return (await res.json()) as PagedResponse<ApplicationLogDto>;
  }

  static async getAdminLog(id: string): Promise<ApplicationLogDto> {
    const res = await fetch(`${API_BASE}/admin/logs/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load log (${res.status}): ${text || res.statusText}`);
    }

    return (await res.json()) as ApplicationLogDto;
  }

  static async deleteAdminLog(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/logs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to delete log (${res.status}): ${text || res.statusText}`);
    }
  }
}