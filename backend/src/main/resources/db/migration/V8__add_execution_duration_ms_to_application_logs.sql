ALTER TABLE application_logs
ADD COLUMN IF NOT EXISTS execution_duration_ms BIGINT;