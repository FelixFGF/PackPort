-- Error reporting persistence foundation
-- Stores frontend crash reports and supports admin resolution/deletion.

CREATE TABLE IF NOT EXISTS error_reports (
    id uuid PRIMARY KEY,
    timestamp_utc timestamptz NOT NULL DEFAULT now(),

    severity varchar(50) NOT NULL,
    error_message text NOT NULL,
    stacktrace text NOT NULL,

    job_id varchar(255),

    browser varchar(255),
    operating_system varchar(255),

    minecraft_version varchar(255),
    loader varchar(255),
    modpack_name varchar(255),
    installed_mods text,

    application_version varchar(255),
    logs text,
    user_notes text,

    resolved boolean NOT NULL DEFAULT false,
    resolved_by varchar(255),
    resolved_at timestamptz
);

-- Useful index for admin browsing
CREATE INDEX IF NOT EXISTS idx_error_reports_timestamp_utc ON error_reports (timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_error_reports_severity ON error_reports (severity);