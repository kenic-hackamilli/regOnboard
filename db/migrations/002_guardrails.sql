ALTER TABLE onboard_applications
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_contact_email_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_contact_phone_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_country_of_incorporation_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_company_name_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_company_registration_number_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_company_tin_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_current_section_length,
  DROP CONSTRAINT IF EXISTS chk_onboard_applications_final_submission_snapshot_is_object;

ALTER TABLE onboard_applications
  ADD CONSTRAINT chk_onboard_applications_contact_email_length
    CHECK (contact_email IS NULL OR char_length(contact_email) <= 254) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_contact_phone_length
    CHECK (contact_phone IS NULL OR char_length(contact_phone) <= 30) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_country_of_incorporation_length
    CHECK (country_of_incorporation IS NULL OR char_length(country_of_incorporation) <= 120) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_company_name_length
    CHECK (company_name IS NULL OR char_length(company_name) <= 160) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_company_registration_number_length
    CHECK (company_registration_number IS NULL OR char_length(company_registration_number) <= 120) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_company_tin_length
    CHECK (company_tin IS NULL OR char_length(company_tin) <= 120) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_current_section_length
    CHECK (current_section IS NULL OR char_length(current_section) <= 64) NOT VALID,
  ADD CONSTRAINT chk_onboard_applications_final_submission_snapshot_is_object
    CHECK (
      final_submission_snapshot IS NULL
      OR jsonb_typeof(final_submission_snapshot) = 'object'
    ) NOT VALID;

ALTER TABLE onboard_sections
  DROP CONSTRAINT IF EXISTS chk_onboard_sections_data_is_object,
  DROP CONSTRAINT IF EXISTS chk_onboard_sections_validation_errors_is_array;

ALTER TABLE onboard_sections
  ADD CONSTRAINT chk_onboard_sections_data_is_object
    CHECK (jsonb_typeof(data) = 'object') NOT VALID,
  ADD CONSTRAINT chk_onboard_sections_validation_errors_is_array
    CHECK (jsonb_typeof(validation_errors) = 'array') NOT VALID;
