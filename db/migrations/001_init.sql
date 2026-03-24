CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS onboard_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('local', 'international')),
  status TEXT NOT NULL CHECK (
    status IN (
      'draft',
      'collecting_documents',
      'ready_for_submission',
      'submitted',
      'in_review',
      'changes_requested',
      'approved',
      'rejected'
    )
  ),
  access_mode TEXT NOT NULL DEFAULT 'guest',
  draft_token_hash TEXT NOT NULL,
  resume_token_hash TEXT,
  resume_code TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_verified BOOLEAN NOT NULL DEFAULT FALSE,
  country_of_incorporation TEXT,
  company_name TEXT,
  company_registration_number TEXT,
  company_tin TEXT,
  current_section TEXT,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  final_submission_snapshot JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboard_applications_status ON onboard_applications(status);
CREATE INDEX IF NOT EXISTS idx_onboard_applications_updated_at ON onboard_applications(updated_at DESC);

CREATE TABLE IF NOT EXISTS onboard_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES onboard_applications(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL CHECK (
    section_code IN (
      'SECTION_A_GENERAL_INFORMATION',
      'SECTION_B_BUSINESS_INFORMATION',
      'SECTION_C_DOMAIN_ADMINISTRATION',
      'SECTION_D_BUSINESS_DEVELOPMENT',
      'SECTION_E_LEGAL_STRUCTURE',
      'SECTION_F_DECLARATION'
    )
  ),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, section_code)
);

CREATE TABLE IF NOT EXISTS onboard_document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('local', 'international')),
  requirement_code TEXT NOT NULL,
  label TEXT NOT NULL,
  equivalent_label TEXT,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  allowed_mime_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  max_files INTEGER NOT NULL DEFAULT 1,
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (applicant_type, requirement_code)
);

CREATE TABLE IF NOT EXISTS onboard_document_blobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content BYTEA NOT NULL,
  content_size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboard_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES onboard_applications(id) ON DELETE CASCADE,
  requirement_code TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'upload',
  original_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  blob_id UUID REFERENCES onboard_document_blobs(id) ON DELETE SET NULL,
  storage_mode TEXT NOT NULL DEFAULT 'postgres_bytea',
  checksum TEXT,
  upload_status TEXT NOT NULL DEFAULT 'uploaded',
  ocr_status TEXT DEFAULT 'not_started',
  document_status TEXT DEFAULT 'uploaded',
  extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, requirement_code)
);

CREATE INDEX IF NOT EXISTS idx_onboard_documents_application_id ON onboard_documents(application_id);

CREATE TABLE IF NOT EXISTS onboard_draft_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES onboard_applications(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('draft', 'resume')),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboard_draft_sessions_application_id ON onboard_draft_sessions(application_id);

CREATE TABLE IF NOT EXISTS onboard_review_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES onboard_applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted',
  assigned_to TEXT,
  reviewer_notes TEXT,
  decision TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id)
);

CREATE TABLE IF NOT EXISTS onboard_events (
  id BIGSERIAL PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES onboard_applications(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO onboard_document_requirements (
  applicant_type,
  requirement_code,
  label,
  equivalent_label,
  description,
  is_required,
  allowed_mime_types,
  max_files,
  validation_rules
)
VALUES
  (
    'local',
    'CR12_OR_EQUIVALENT',
    'Latest CR12 (Company Registry Search)',
    'Certificate of Good Standing, Company Registry Extract, or equivalent directorship/shareholding disclosure document.',
    'Latest CR12.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'local',
    'TAX_COMPLIANCE_OR_EQUIVALENT',
    'Tax Compliance Certificate',
    'Tax Clearance Certificate, Tax Good Standing Letter, or equivalent from your country''s revenue authority.',
    'Tax Compliance Certificate.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'local',
    'TIN_CERTIFICATE_OR_EQUIVALENT',
    'KRA PIN Certificate',
    'Tax Identification Number (TIN) Certificate, VAT Registration Certificate, or equivalent tax registration document.',
    'KRA PIN Certificate.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'local',
    'CERTIFICATE_OF_INCORPORATION',
    'Certificate of Incorporation',
    'Certificate of Incorporation, Certificate of Registration, or equivalent company formation document from your jurisdiction.',
    'Certificate of Incorporation.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'local',
    'PASSPORT_PHOTO',
    'Passport Photo (of authorised representative)',
    NULL,
    'Passport Photo.',
    TRUE,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["image"]}'::jsonb
  ),
  (
    'international',
    'CR12_OR_EQUIVALENT',
    'Latest CR12 (Company Registry Search)',
    'Certificate of Good Standing, Company Registry Extract, or equivalent directorship/shareholding disclosure document.',
    'Equivalent directorship or shareholding disclosure document.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'international',
    'TAX_COMPLIANCE_OR_EQUIVALENT',
    'Tax Compliance Certificate',
    'Tax Clearance Certificate, Tax Good Standing Letter, or equivalent from your country''s revenue authority.',
    'Tax compliance evidence from the applicant jurisdiction.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'international',
    'TIN_CERTIFICATE_OR_EQUIVALENT',
    'KRA PIN Certificate',
    'Tax Identification Number (TIN) Certificate, VAT Registration Certificate, or equivalent tax registration document.',
    'Tax registration document from the applicant jurisdiction.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'international',
    'CERTIFICATE_OF_INCORPORATION',
    'Certificate of Incorporation',
    'Certificate of Incorporation, Certificate of Registration, or equivalent company formation document from your jurisdiction.',
    'Company formation document from the applicant jurisdiction.',
    TRUE,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["pdf","image"]}'::jsonb
  ),
  (
    'international',
    'PASSPORT_PHOTO',
    'Passport Photo (of authorised representative)',
    NULL,
    'Passport Photo.',
    TRUE,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    '{"accepts":["image"]}'::jsonb
  )
ON CONFLICT (applicant_type, requirement_code) DO NOTHING;
