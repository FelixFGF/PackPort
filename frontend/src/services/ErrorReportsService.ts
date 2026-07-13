import { API_BASE } from "../config/api";
import { ErrorReportDto, ErrorReportSubmissionPayload } from "../types/errorReports";

export class ErrorReportsService {
  static async submitReport(
    payload: ErrorReportSubmissionPayload,
  ): Promise<ErrorReportDto> {
    const res = await fetch(`${API_BASE}/errors/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to submit report (${res.status}): ${text || res.statusText}`,
      );
    }

    return (await res.json()) as ErrorReportDto;
  }

  static async listAdminErrors(limit = 50): Promise<ErrorReportDto[]> {
    const url = new URL(`${API_BASE}/admin/errors`);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to load reports (${res.status}): ${text || res.statusText}`,
      );
    }

    return (await res.json()) as ErrorReportDto[];
  }

  static async getAdminError(id: string): Promise<ErrorReportDto> {
    const res = await fetch(`${API_BASE}/admin/errors/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to load report (${res.status}): ${text || res.statusText}`,
      );
    }

    return (await res.json()) as ErrorReportDto;
  }

  static async resolveAdminError(
    id: string,
    resolvedBy: string,
  ): Promise<ErrorReportDto> {
    const res = await fetch(`${API_BASE}/admin/errors/${id}/resolve`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolvedBy }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to resolve report (${res.status}): ${text || res.statusText}`,
      );
    }

    return (await res.json()) as ErrorReportDto;
  }

  static async deleteAdminError(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/errors/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to delete report (${res.status}): ${text || res.statusText}`,
      );
    }
  }
}