-- Initial schema for Analytics module (Phase 1 foundation)
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id BIGSERIAL PRIMARY KEY,
  recorded_at TIMESTAMPTZ NOT NULL,
  visitors_total BIGINT NOT NULL,
  visitors_today BIGINT NOT NULL,
  active_users BIGINT NOT NULL,
  conversions_total BIGINT NOT NULL,
  conversions_successful BIGINT NOT NULL,
  conversions_failed BIGINT NOT NULL,
  average_conversion_duration_ms BIGINT NOT NULL,
  uploads BIGINT NOT NULL,
  downloads BIGINT NOT NULL,
  running_jobs BIGINT NOT NULL,
  backend_uptime_seconds BIGINT NOT NULL
);