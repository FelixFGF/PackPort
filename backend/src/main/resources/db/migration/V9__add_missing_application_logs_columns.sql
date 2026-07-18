ALTER TABLE application_logs
ADD COLUMN IF NOT EXISTS http_method VARCHAR(20);

ALTER TABLE application_logs
ADD COLUMN IF NOT EXISTS request_path VARCHAR(500);

ALTER TABLE application_logs
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE application_logs
ADD COLUMN IF NOT EXISTS browser VARCHAR(100);

ALTER TABLE application_logs
ADD COLUMN IF NOT EXISTS operating_system VARCHAR(100);