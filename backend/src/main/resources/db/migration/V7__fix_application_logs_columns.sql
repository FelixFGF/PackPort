-- Fix schema drift: ApplicationLogEntity contains browser/operating_system,
-- but older migrations (e.g. V4__init_admin_logs_schema.sql) may not create those columns.
-- Use IF NOT EXISTS to keep this migration idempotent across environments.

ALTER TABLE application_logs
    ADD COLUMN IF NOT EXISTS browser TEXT;

ALTER TABLE application_logs
    ADD COLUMN IF NOT EXISTS operating_system TEXT;