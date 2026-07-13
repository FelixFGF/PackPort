-- Extend Analytics schema for historical telemetry (Phase 3)
-- Must not break existing tables/migrations.

-- Normalized historical event log
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,

  timestamp_utc TIMESTAMPTZ NOT NULL,

  event_type TEXT NOT NULL,

  -- operations (nullable until/if available)
  upload_count BIGINT NULL,
  download_count BIGINT NULL,

  conversion_started BOOLEAN NULL,
  conversion_finished BOOLEAN NULL,
  conversion_failed BOOLEAN NULL,

  conversion_duration_ms BIGINT NULL,

  -- metadata (nullable)
  minecraft_version TEXT NULL,
  mod_loader TEXT NULL,
  operating_system TEXT NULL,
  application_version TEXT NULL,
  modpack_name TEXT NULL,

  job_id TEXT NULL
);

-- Indexes for fast admin querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp
  ON analytics_events (timestamp_utc);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type
  ON analytics_events (event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_job_id
  ON analytics_events (job_id);

-- Loader distribution support (computed on read for flexibility, but we keep
-- a dedicated table placeholder for future expansion/normalization)
CREATE TABLE IF NOT EXISTS loader_fingerprints (
  id BIGSERIAL PRIMARY KEY,
  mod_loader TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
