-- Application logs table
CREATE TABLE IF NOT EXISTS application_logs (
    id UUID PRIMARY KEY,
    timestamp_utc TIMESTAMPTZ NOT NULL,
    level VARCHAR(16) NOT NULL,
    source VARCHAR(255),
    logger VARCHAR(255),
    message TEXT,
    exception_text TEXT,
    stacktrace TEXT,
    job_id VARCHAR(255),
    user_agent TEXT,
    request_path TEXT,
    duration_ms BIGINT,
    thread_name VARCHAR(255)
);

-- Admin activity (audit events) table
CREATE TABLE IF NOT EXISTS admin_activity_events (
    id UUID PRIMARY KEY,
    timestamp_utc TIMESTAMPTZ NOT NULL,
    username VARCHAR(255),
    action VARCHAR(80) NOT NULL,
    description TEXT,
    ip_address VARCHAR(64),
    browser VARCHAR(255),
    operating_system VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON application_logs (timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs (level);
CREATE INDEX IF NOT EXISTS idx_application_logs_logger ON application_logs (logger);
CREATE INDEX IF NOT EXISTS idx_application_logs_job_id ON application_logs (job_id);

CREATE INDEX IF NOT EXISTS idx_admin_activity_timestamp ON admin_activity_events (timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_events (action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_username ON admin_activity_events (username);