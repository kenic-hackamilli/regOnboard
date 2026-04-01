CREATE TABLE IF NOT EXISTS onboard_portal_runtime_state (
  portal_key TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  reason TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO onboard_portal_runtime_state (
  portal_key,
  status,
  reason,
  updated_by
)
VALUES (
  'applicant_portal',
  'active',
  NULL,
  'migration'
)
ON CONFLICT (portal_key) DO NOTHING;
