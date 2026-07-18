import { API_BASE } from "../config/api";
import { AdminActivityDto } from "../types/adminActivity";

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export class AdminActivityService {
  static async listAdminActivity(params: {
    page: number;
    size: number;
    username?: string;
    action?: string;
    description?: string;
  }): Promise<PagedResponse<AdminActivityDto>> {
    const url = new URL(`${API_BASE}/activity`);
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("size", String(params.size));
    if (params.username) url.searchParams.set("username", params.username);
    if (params.action) url.searchParams.set("action", params.action);
    if (params.description) url.searchParams.set("description", params.description);

    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load activity (${res.status}): ${text || res.statusText}`);
    }

    return (await res.json()) as PagedResponse<AdminActivityDto>;
  }

  static async getAdminActivity(id: string): Promise<AdminActivityDto> {
    const res = await fetch(`${API_BASE}/activity/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load activity (${res.status}): ${text || res.statusText}`);
    }

    return (await res.json()) as AdminActivityDto;
  }
}