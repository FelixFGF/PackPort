import { API_BASE } from "../config/api";

export type AnalyticsOverviewResponse = {
  totalVisitors: number;
  visitorsToday: number;
  activeUsers: number;
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  averageConversionTime: number;
  uploads: number;
  downloads: number;
  runningJobs: number;
  backendUptime: number;
};

export class AdminAnalyticsService {
  static async fetchAnalyticsOverview(
    signal?: AbortSignal
  ): Promise<AnalyticsOverviewResponse> {
    const res = await fetch(`${API_BASE}/api/admin/analytics/overview`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to load analytics (${res.status}). ${text ? `- ${text}` : ""}`
      );
    }

    return res.json();
  }
}