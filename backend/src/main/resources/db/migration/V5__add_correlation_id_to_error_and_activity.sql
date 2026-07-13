-- Add correlation_id to error_reports and admin_activity_events so
-- the same correlation id can be reused across ApplicationLog/ErrorReport/AdminActivity.

ALTER TABLE error_reports
    ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_error_reports_correlation_id ON error_reports (correlation_id);

ALTER TABLE admin_activity_events
    ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_admin_activity_correlation_id ON admin_activity_events (correlation_id);