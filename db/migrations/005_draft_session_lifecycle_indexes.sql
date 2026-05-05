CREATE INDEX IF NOT EXISTS idx_onboard_draft_sessions_token_hash
  ON onboard_draft_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_onboard_draft_sessions_expires_at
  ON onboard_draft_sessions(expires_at);
