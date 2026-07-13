import { useEffect, useMemo, useState } from "react";
import {
  AdminAnalyticsService,
  type AnalyticsOverviewResponse,
} from "../services/AdminAnalyticsService";

export function useAnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);

  const initialRequest = useMemo(() => {
    const controller = new AbortController();
    return controller;
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminAnalyticsService.fetchAnalyticsOverview(
          initialRequest.signal
        );
        setData(res);
        setLastRefreshedAt(Date.now());
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setError((e as Error)?.message ?? "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => initialRequest.abort();
  }, [initialRequest]);

  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const controller = new AbortController();
        const res = await AdminAnalyticsService.fetchAnalyticsOverview(
          controller.signal
        );
        setData(res);
        setLastRefreshedAt(Date.now());
      } catch (e) {
        // Keep old data; surface error but don’t flip loading
        setError((e as Error)?.message ?? "Failed to refresh analytics");
      }
    }, 30_000);

    return () => window.clearInterval(id);
  }, []);

  return { data, loading, error, lastRefreshedAt };
}