ALTER TABLE onboard_document_requirements
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 100;

UPDATE onboard_document_requirements
SET display_order = CASE requirement_code
  WHEN 'CERTIFICATE_OF_INCORPORATION' THEN 10
  WHEN 'CR12_OR_EQUIVALENT' THEN 20
  WHEN 'TIN_CERTIFICATE_OR_EQUIVALENT' THEN 30
  WHEN 'TAX_COMPLIANCE_OR_EQUIVALENT' THEN 40
  WHEN 'PASSPORT_PHOTO' THEN 50
  ELSE 100
END;

CREATE INDEX IF NOT EXISTS idx_onboard_document_requirements_applicant_type_display_order
  ON onboard_document_requirements(applicant_type, display_order, requirement_code);
