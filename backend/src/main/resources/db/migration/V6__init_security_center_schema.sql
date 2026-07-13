-- Security Center schema (Security Events, Active Sessions, Login Attempts)
-- Environment variables only; secrets must not be hardcoded.

CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  username VARCHAR(64),
  ip_address VARCHAR(64) NOT NULL,
  user_agent VARCHAR(255) NOT NULL,
  browser VARCHAR(255),
  operating_system VARCHAR(255),
  severity VARCHAR(64) NOT NULL,
  details VARCHAR(255),
  occurred_at TIMESTAMPTZ NOT NULL,
  correlation_id VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_security_events_occurred_at ON security_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_username ON security_events (username);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events (event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events (ip_address);

CREATE TABLE IF NOT EXISTS active_admin_sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  login_time TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(64) NOT NULL,
  user_agent VARCHAR(1024) NOT NULL,
  browser VARCHAR(255),
  operating_system VARCHAR(255),
  correlation_id VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_active_admin_sessions_username ON active_admin_sessions (username);
CREATE INDEX IF NOT EXISTS idx_active_admin_sessions_last_activity ON active_admin_sessions (last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_active_admin_sessions_ip ON active_admin_sessions (ip_address);

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  username VARCHAR(64),
  ip_address VARCHAR(64) NOT NULL,
  user_agent VARCHAR(255) NOT NULL,
  browser VARCHAR(255),
  operating_system VARCHAR(255),
  occurred_at TIMESTAMPTZ NOT NULL,
  correlation_id VARCHAR(128),
  success BOOLEAN NOT NULL,
  reason VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_occurred_at ON login_attempts (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts (username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_event_type ON login_attempts (event_type);