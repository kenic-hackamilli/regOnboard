import type { PoolClient, QueryResultRow } from "pg";
import { query, withTransaction } from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";
import {
  APPLICANT_TYPES,
  type ApplicantType,
  COUNTRY_OF_INCORPORATION_MAX_LENGTH,
  FORM_SECTION_CODES,
  type SectionCode,
  type SectionPayloadMap,
  sanitizeSectionDraft,
  sectionSchemas,
  validateSection,
} from "../utils/sections.js";
import { createOpaqueToken, createResumeCode, hashToken, hoursFromNow } from "../utils/tokens.js";

type ApplicationRow = QueryResultRow & {
  id: string;
  applicant_type: ApplicantType;
  status: string;
  access_mode: string;
  draft_token_hash: string;
  resume_token_hash: string | null;
  resume_code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_verified: boolean;
  country_of_incorporation: string | null;
  company_name: string | null;
  company_registration_number: string | null;
  company_tin: string | null;
  current_section: string | null;
  progress_percent: number | null;
  final_submission_snapshot: unknown;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

type SectionRow = QueryResultRow & {
  section_code: SectionCode;
  data: unknown;
  is_complete: boolean;
  validation_errors: Array<{ path: string; message: string }> | null;
  version: number;
  updated_at: string;
};

type RequirementRow = QueryResultRow & {
  requirement_code: string;
  label: string;
  equivalent_label: string | null;
  description: string | null;
  is_required: boolean;
  allowed_mime_types: string[] | null;
  max_files: number;
  validation_rules: Record<string, unknown> | null;
};

type ChecklistDocumentRow = RequirementRow & {
  document_id: string | null;
  upload_status: string | null;
  document_status: string | null;
  mime_type: string | null;
  size_bytes: number | null;
};

type DocumentRow = QueryResultRow & {
  id: string;
  application_id: string;
  requirement_code: string;
  source: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  blob_id: string | null;
  storage_mode: string;
  checksum: string | null;
  upload_status: string;
  ocr_status: string | null;
  document_status: string | null;
  extracted_data: Record<string, unknown> | null;
  validation_results: Record<string, unknown> | null;
  uploaded_at: string | null;
  updated_at: string;
};

type ReviewTaskRow = QueryResultRow & {
  id: string;
  status: string;
  reviewer_notes: string | null;
  decision: string | null;
  updated_at: string;
};

type SectionValidationResult = ReturnType<typeof validateSection>;

type ValidatedFormSection = {
  sectionCode: SectionCode;
  sanitizedPayload: Record<string, unknown>;
  validation: SectionValidationResult;
  nextVersion: number;
};

const APPLICATION_SELECT = `
  id,
  applicant_type,
  status,
  access_mode,
  draft_token_hash,
  resume_token_hash,
  resume_code,
  contact_email,
  contact_phone,
  contact_verified,
  country_of_incorporation,
  company_name,
  company_registration_number,
  company_tin,
  current_section,
  progress_percent,
  final_submission_snapshot,
  submitted_at,
  created_at,
  updated_at
`;

const FORM_SUBMISSION_FINAL_SECTION =
  FORM_SECTION_CODES[FORM_SECTION_CODES.length - 1] ?? "SECTION_A_GENERAL_INFORMATION";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const assertApplicantType = (value: string): ApplicantType => {
  if (!APPLICANT_TYPES.includes(value as ApplicantType)) {
    throw new ApiError(400, "INVALID_APPLICANT_TYPE");
  }
  return value as ApplicantType;
};

const normalizeCountryKey = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, " ") || "";

const normalizeCountryOfIncorporation = (
  applicantType: ApplicantType,
  value?: string | null
) => {
  if (applicantType === "local") {
    return "Kenya";
  }

  const normalized = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

  if (!normalized) {
    return "";
  }

  if (normalized.length > COUNTRY_OF_INCORPORATION_MAX_LENGTH) {
    throw new ApiError(400, "COUNTRY_OF_INCORPORATION_TOO_LONG");
  }

  if (normalizeCountryKey(normalized) === "kenya") {
    throw new ApiError(400, "COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL");
  }

  return normalized;
};

const recordEvent = async (
  client: PoolClient,
  applicationId: string,
  actorType: "applicant" | "admin" | "system",
  actorId: string | null,
  eventType: string,
  payload: Record<string, unknown>
) => {
  await client.query(
    `
      INSERT INTO onboard_events (application_id, actor_type, actor_id, event_type, payload)
      VALUES ($1, $2, $3, $4, $5::jsonb)
    `,
    [applicationId, actorType, actorId, eventType, JSON.stringify(payload)]
  );
};

const getRequirements = async (client: PoolClient, applicantType: ApplicantType) =>
  (await client.query<RequirementRow>(
    `
      SELECT requirement_code, label, equivalent_label, description, is_required, allowed_mime_types, max_files, validation_rules
      FROM onboard_document_requirements
      WHERE applicant_type = $1
      ORDER BY requirement_code
    `,
    [applicantType]
  )).rows;

const getChecklistDocuments = async (
  client: PoolClient,
  applicationId: string,
  applicantType: ApplicantType
) =>
  (await client.query<ChecklistDocumentRow>(
    `
      SELECT
        r.requirement_code,
        r.label,
        r.equivalent_label,
        r.description,
        r.is_required,
        r.allowed_mime_types,
        r.max_files,
        r.validation_rules,
        d.id AS document_id,
        d.upload_status,
        d.document_status,
        d.mime_type,
        d.size_bytes
      FROM onboard_document_requirements r
      LEFT JOIN onboard_documents d
        ON d.application_id = $1
       AND d.requirement_code = r.requirement_code
      WHERE r.applicant_type = $2
      ORDER BY r.requirement_code
    `,
    [applicationId, applicantType]
  )).rows;

const getSections = async (client: PoolClient, applicationId: string) =>
  (await client.query<SectionRow>(
    `
      SELECT section_code, data, is_complete, validation_errors, version, updated_at
      FROM onboard_sections
      WHERE application_id = $1
      ORDER BY section_code
    `,
    [applicationId]
  )).rows;

const toPublicApplication = (application: ApplicationRow) => ({
  id: application.id,
  applicantType: application.applicant_type,
  status: application.status,
  accessMode: application.access_mode,
  resumeCode: application.resume_code,
  contactEmail: application.contact_email,
  contactPhone: application.contact_phone,
  contactVerified: application.contact_verified,
  countryOfIncorporation: application.country_of_incorporation,
  companyName: application.company_name,
  companyRegistrationNumber: application.company_registration_number,
  companyTin: application.company_tin,
  currentSection: application.current_section,
  progressPercent: application.progress_percent ?? 0,
  submittedAt: application.submitted_at,
  createdAt: application.created_at,
  updatedAt: application.updated_at,
});

const computeReadiness = (
  sections: SectionRow[],
  documents: ChecklistDocumentRow[]
) => {
  const completedSectionCount = FORM_SECTION_CODES.filter((code) =>
    sections.find((section) => section.section_code === code)?.is_complete
  ).length;

  const documentsComplete = documents
    .filter((document) => document.is_required)
    .every((document) => Boolean(document.document_id));

  const totalParts = FORM_SECTION_CODES.length;
  const completedParts = completedSectionCount;
  const progressPercent = Math.round((completedParts / totalParts) * 100);

  return {
    completedSectionCount,
    documentsComplete,
    readyForSubmission: completedSectionCount === FORM_SECTION_CODES.length,
    progressPercent,
  };
};

const deriveApplicationStatus = (
  currentStatus: string,
  readyForSubmission: boolean
) => {
  if (["submitted", "in_review", "approved", "rejected", "changes_requested"].includes(currentStatus)) {
    return currentStatus;
  }

  if (readyForSubmission) return "ready_for_submission";
  return "draft";
};

const assertWritableApplication = (application: ApplicationRow) => {
  if (["submitted", "in_review", "approved", "rejected"].includes(application.status)) {
    throw new ApiError(409, "APPLICATION_ALREADY_SUBMITTED");
  }
};

const extractSectionsPayload = (payload: unknown) => {
  if (!isRecord(payload)) {
    throw new ApiError(400, "INVALID_APPLICATION_FORM_PAYLOAD");
  }

  return isRecord(payload.sections) ? payload.sections : payload;
};

const buildFormValidationDetails = (sections: ValidatedFormSection[]) => ({
  sections: sections.map((section) => ({
    sectionCode: section.sectionCode,
    validationErrors: section.validation.errors,
    hasActionableErrors: section.validation.hasActionableErrors,
    isComplete: section.validation.isComplete,
  })),
});

const validateApplicationFormPayload = async (
  client: PoolClient,
  application: ApplicationRow,
  payload: unknown
) => {
  const sectionPayloads = extractSectionsPayload(payload);
  const currentSections = await getSections(client, application.id);
  const currentSectionMap = new Map(
    currentSections.map((section) => [section.section_code, section] as const)
  );

  const validatedSections = FORM_SECTION_CODES.map((sectionCode) => {
    const sectionPayload = sectionPayloads[sectionCode];
    const sanitizedPayload = sanitizeSectionDraft(sectionCode, sectionPayload) as Record<
      string,
      unknown
    >;
    const validation = validateSection(sectionCode, sectionPayload, {
      applicantType: application.applicant_type,
      countryOfIncorporation: application.country_of_incorporation,
    });

    return {
      sectionCode,
      sanitizedPayload,
      validation,
      nextVersion: (currentSectionMap.get(sectionCode)?.version ?? 1) + 1,
    };
  });

  const invalidSections = validatedSections.filter((section) => !section.validation.isComplete);
  if (invalidSections.length > 0) {
    throw new ApiError(400, "APPLICATION_FORM_INVALID", buildFormValidationDetails(invalidSections));
  }

  return validatedSections;
};

const persistValidatedApplicationForm = async (
  client: PoolClient,
  application: ApplicationRow,
  validatedSections: ValidatedFormSection[],
  eventType = "application_form_saved"
) => {
  for (const section of validatedSections) {
    await client.query(
      `
        UPDATE onboard_sections
        SET
          data = $3::jsonb,
          version = $4,
          is_complete = true,
          validation_errors = '[]'::jsonb,
          updated_at = NOW()
        WHERE application_id = $1 AND section_code = $2
      `,
      [
        application.id,
        section.sectionCode,
        JSON.stringify(section.sanitizedPayload),
        section.nextVersion,
      ]
    );
  }

  const sectionA = validatedSections.find(
    (section) => section.sectionCode === "SECTION_A_GENERAL_INFORMATION"
  )?.validation.data as SectionPayloadMap["SECTION_A_GENERAL_INFORMATION"] | undefined;

  if (!sectionA) {
    throw new ApiError(500, "SECTION_A_REQUIRED_FOR_FORM_SAVE");
  }

  await client.query(
    `
      UPDATE onboard_applications
      SET
        company_name = $2,
        company_registration_number = $3,
        company_tin = $4,
        contact_email = $5,
        contact_phone = $6,
        current_section = $7,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      application.id,
      sectionA.companyName,
      sectionA.companyRegistrationNumber,
      sectionA.companyTin,
      sectionA.emailAddress,
      sectionA.telephoneNumber,
      FORM_SUBMISSION_FINAL_SECTION,
    ]
  );

  await recordEvent(client, application.id, "applicant", null, eventType, {
    sectionCount: validatedSections.length,
  });

  return recalculateApplicationState(client, application);
};

const recalculateApplicationState = async (
  client: PoolClient,
  application: ApplicationRow
) => {
  const sections = await getSections(client, application.id);
  const documents = await getChecklistDocuments(client, application.id, application.applicant_type);
  const readiness = computeReadiness(sections, documents);
  const nextStatus = deriveApplicationStatus(application.status, readiness.readyForSubmission);

  const updatedApplication = (
    await client.query<ApplicationRow>(
      `
        UPDATE onboard_applications
        SET progress_percent = $2, status = $3, updated_at = NOW()
        WHERE id = $1
        RETURNING ${APPLICATION_SELECT}
      `,
      [application.id, readiness.progressPercent, nextStatus]
    )
  ).rows[0];

  if (!updatedApplication) {
    throw new ApiError(500, "FAILED_TO_UPDATE_APPLICATION_STATE");
  }

  return {
    application: updatedApplication,
    sections,
    documents,
    ...readiness,
  };
};

const assertAccess = async (applicationId: string, token: string) => {
  const tokenHash = hashToken(token);
  const rows = await query<ApplicationRow>(
    `
      SELECT ${APPLICATION_SELECT}
      FROM onboard_applications
      WHERE id = $1
        AND (draft_token_hash = $2 OR resume_token_hash = $2)
      LIMIT 1
    `,
    [applicationId, tokenHash]
  );

  const application = rows[0];
  if (!application) {
    throw new ApiError(401, "INVALID_OR_EXPIRED_DRAFT_TOKEN");
  }

  return application;
};

export const getAuthorizedApplication = assertAccess;

export const createApplication = async (input: {
  applicantType: string;
  countryOfIncorporation?: string | null;
}) =>
  withTransaction(async (client) => {
    const applicantType = assertApplicantType(input.applicantType);
    const countryOfIncorporation = normalizeCountryOfIncorporation(
      applicantType,
      input.countryOfIncorporation
    );

    if (applicantType === "international" && !countryOfIncorporation) {
      throw new ApiError(400, "COUNTRY_OF_INCORPORATION_REQUIRED");
    }

    const draftToken = createOpaqueToken("draft");
    const resumeToken = createOpaqueToken("resume");
    const resumeCode = createResumeCode();

    const application = (
      await client.query<ApplicationRow>(
        `
          INSERT INTO onboard_applications (
            applicant_type,
            status,
            access_mode,
            draft_token_hash,
            resume_token_hash,
            resume_code,
            country_of_incorporation,
            current_section,
            progress_percent
          )
          VALUES ($1, 'draft', 'guest', $2, $3, $4, $5, $6, 0)
          RETURNING ${APPLICATION_SELECT}
        `,
        [
          applicantType,
          hashToken(draftToken),
          hashToken(resumeToken),
          resumeCode,
          countryOfIncorporation || null,
          "SECTION_A_GENERAL_INFORMATION",
        ]
      )
    ).rows[0];

    if (!application) {
      throw new ApiError(500, "FAILED_TO_CREATE_APPLICATION");
    }

    for (const sectionCode of FORM_SECTION_CODES) {
      await client.query(
        `
          INSERT INTO onboard_sections (
            application_id,
            section_code,
            data,
            version,
            is_complete,
            validation_errors
          )
          VALUES ($1, $2, '{}'::jsonb, 1, false, '[]'::jsonb)
        `,
        [application.id, sectionCode]
      );
    }

    await client.query(
      `
        INSERT INTO onboard_draft_sessions (application_id, token_hash, session_type, last_used_at, expires_at)
        VALUES ($1, $2, 'draft', NOW(), $3), ($1, $4, 'resume', NOW(), $3)
      `,
      [
        application.id,
        hashToken(draftToken),
        hoursFromNow(env.DRAFT_SESSION_TTL_HOURS),
        hashToken(resumeToken),
      ]
    );

    await recordEvent(client, application.id, "applicant", null, "application_created", {
      applicantType,
      countryOfIncorporation: countryOfIncorporation || null,
    });

    const checklistDocuments = await getChecklistDocuments(client, application.id, applicantType);
    const sections = await getSections(client, application.id);

    return {
      application: toPublicApplication(application),
      draftToken,
      resumeToken,
      resumeCode,
      checklist: {
        sections: sections.map((section) => ({
          sectionCode: section.section_code,
          isComplete: section.is_complete,
          validationErrors: section.validation_errors ?? [],
        })),
        documents: checklistDocuments.map((document) => ({
          requirementCode: document.requirement_code,
          label: document.label,
          equivalentLabel: document.equivalent_label,
          description: document.description,
          isRequired: document.is_required,
          uploaded: Boolean(document.document_id),
          documentId: document.document_id,
          documentStatus: document.document_status,
        })),
      },
    };
  });

export const getApplicationBundle = async (applicationId: string, token: string) => {
  const application = await assertAccess(applicationId, token);
  const rows = await query<SectionRow>(
    `
      SELECT section_code, data, is_complete, validation_errors, version, updated_at
      FROM onboard_sections
      WHERE application_id = $1
      ORDER BY section_code
    `,
    [applicationId]
  );

  const documentRows = await query<DocumentRow>(
    `
      SELECT
        id,
        application_id,
        requirement_code,
        source,
        original_name,
        mime_type,
        size_bytes,
        blob_id,
        storage_mode,
        checksum,
        upload_status,
        ocr_status,
        document_status,
        extracted_data,
        validation_results,
        uploaded_at,
        updated_at
      FROM onboard_documents
      WHERE application_id = $1
      ORDER BY requirement_code
    `,
    [applicationId]
  );

  const checklistDocuments = await query<ChecklistDocumentRow>(
    `
      SELECT
        r.requirement_code,
        r.label,
        r.equivalent_label,
        r.description,
        r.is_required,
        r.allowed_mime_types,
        r.max_files,
        r.validation_rules,
        d.id AS document_id,
        d.upload_status,
        d.document_status,
        d.mime_type,
        d.size_bytes
      FROM onboard_document_requirements r
      LEFT JOIN onboard_documents d
        ON d.application_id = $1
       AND d.requirement_code = r.requirement_code
      WHERE r.applicant_type = $2
      ORDER BY r.requirement_code
    `,
    [applicationId, application.applicant_type]
  );

  const readiness = computeReadiness(rows, checklistDocuments);

  return {
    application: toPublicApplication(application),
    sections: rows.map((section) => ({
      sectionCode: section.section_code,
      data: section.data,
      isComplete: section.is_complete,
      version: section.version,
      validationErrors: section.validation_errors ?? [],
      updatedAt: section.updated_at,
    })),
    checklist: {
      readyForSubmission: readiness.readyForSubmission,
      progressPercent: readiness.progressPercent,
      sections: rows.map((section) => ({
        sectionCode: section.section_code,
        isComplete: section.is_complete,
        validationErrors: section.validation_errors ?? [],
      })),
      documents: checklistDocuments.map((document) => ({
        requirementCode: document.requirement_code,
        label: document.label,
        equivalentLabel: document.equivalent_label,
        description: document.description,
        isRequired: document.is_required,
        uploaded: Boolean(document.document_id),
        documentId: document.document_id,
        documentStatus: document.document_status,
        mimeType: document.mime_type,
        sizeBytes: document.size_bytes,
      })),
    },
    documents: documentRows.map((document) => ({
      id: document.id,
      requirementCode: document.requirement_code,
      source: document.source,
      originalName: document.original_name,
      mimeType: document.mime_type,
      sizeBytes: document.size_bytes,
      uploadStatus: document.upload_status,
      ocrStatus: document.ocr_status,
      documentStatus: document.document_status,
      validationResults: document.validation_results,
      uploadedAt: document.uploaded_at,
      updatedAt: document.updated_at,
    })),
  };
};

export const saveSection = async (
  applicationId: string,
  token: string,
  sectionCode: string,
  payload: unknown
) =>
  withTransaction(async (client) => {
    const application = await assertAccess(applicationId, token);
    assertWritableApplication(application);
    if (!(sectionCode in sectionSchemas)) {
      throw new ApiError(400, "INVALID_SECTION_CODE");
    }

    const typedSectionCode = sectionCode as keyof typeof sectionSchemas;
    const sanitizedPayload = sanitizeSectionDraft(typedSectionCode, payload);
    const validation = validateSection(typedSectionCode, payload, {
      applicantType: application.applicant_type,
      countryOfIncorporation: application.country_of_incorporation,
    });

    const currentRow = (
      await client.query<SectionRow>(
        `
          SELECT section_code, data, is_complete, validation_errors, version, updated_at
          FROM onboard_sections
          WHERE application_id = $1 AND section_code = $2
        `,
        [applicationId, sectionCode]
      )
    ).rows[0];

    await client.query(
      `
        UPDATE onboard_sections
        SET
          data = $3::jsonb,
          version = $4,
          is_complete = $5,
          validation_errors = $6::jsonb,
          updated_at = NOW()
        WHERE application_id = $1 AND section_code = $2
      `,
      [
        applicationId,
        sectionCode,
        JSON.stringify(sanitizedPayload),
        (currentRow?.version ?? 1) + 1,
        validation.isComplete,
        JSON.stringify(validation.errors),
      ]
    );

    if (sectionCode === "SECTION_A_GENERAL_INFORMATION" && validation.ok) {
      const sectionA = validation.data as SectionPayloadMap["SECTION_A_GENERAL_INFORMATION"];
      await client.query(
        `
          UPDATE onboard_applications
          SET
            company_name = $2,
            company_registration_number = $3,
            company_tin = $4,
            contact_email = $5,
            contact_phone = $6,
            current_section = $7,
            updated_at = NOW()
          WHERE id = $1
        `,
        [
          applicationId,
          sectionA.companyName,
          sectionA.companyRegistrationNumber,
          sectionA.companyTin,
          sectionA.emailAddress,
          sectionA.telephoneNumber,
          sectionCode,
        ]
      );
    } else {
      await client.query(
        `
          UPDATE onboard_applications
          SET current_section = $2, updated_at = NOW()
          WHERE id = $1
        `,
        [applicationId, sectionCode]
      );
    }

    await recordEvent(client, applicationId, "applicant", null, "section_saved", {
      sectionCode,
      isComplete: validation.isComplete,
    });

    const nextState = await recalculateApplicationState(client, application);

    return {
      sectionCode,
      isComplete: validation.isComplete,
      validationErrors: validation.errors,
      hasActionableErrors: validation.hasActionableErrors,
      progressPercent: nextState.progressPercent,
      status: nextState.application.status,
    };
  });

export const getChecklist = async (applicationId: string, token: string) => {
  const bundle = await getApplicationBundle(applicationId, token);
  return bundle.checklist;
};

export const saveApplicationForm = async (
  applicationId: string,
  token: string,
  payload: unknown
) =>
  withTransaction(async (client) => {
    const application = await assertAccess(applicationId, token);
    assertWritableApplication(application);

    const validatedSections = await validateApplicationFormPayload(client, application, payload);
    const nextState = await persistValidatedApplicationForm(client, application, validatedSections);

    return {
      application: toPublicApplication(nextState.application),
      checklist: {
        readyForSubmission: nextState.readyForSubmission,
        progressPercent: nextState.progressPercent,
        sections: nextState.sections.map((section) => ({
          sectionCode: section.section_code,
          isComplete: section.is_complete,
          validationErrors: section.validation_errors ?? [],
        })),
        documents: nextState.documents.map((document) => ({
          requirementCode: document.requirement_code,
          label: document.label,
          equivalentLabel: document.equivalent_label,
          description: document.description,
          isRequired: document.is_required,
          uploaded: Boolean(document.document_id),
          documentId: document.document_id,
          documentStatus: document.document_status,
          mimeType: document.mime_type,
          sizeBytes: document.size_bytes,
        })),
      },
    };
  });

export const issueResumeToken = async (applicationId: string, token: string) =>
  withTransaction(async (client) => {
    const application = await assertAccess(applicationId, token);
    const resumeToken = createOpaqueToken("resume");
    const resumeCode = createResumeCode();

    await client.query(
      `
        UPDATE onboard_applications
        SET resume_token_hash = $2, resume_code = $3, updated_at = NOW()
        WHERE id = $1
      `,
      [applicationId, hashToken(resumeToken), resumeCode]
    );

    await client.query(
      `
        INSERT INTO onboard_draft_sessions (application_id, token_hash, session_type, last_used_at, expires_at)
        VALUES ($1, $2, 'resume', NOW(), $3)
      `,
      [applicationId, hashToken(resumeToken), hoursFromNow(env.DRAFT_SESSION_TTL_HOURS)]
    );

    await recordEvent(client, applicationId, "applicant", null, "resume_token_issued", {});

    return {
      applicationId,
      resumeToken,
      resumeCode,
      resumeUrl: `${env.PUBLIC_BASE_URL}/portal?applicationId=${application.id}&token=${resumeToken}`,
    };
  });

export const submitApplication = async (
  applicationId: string,
  token: string,
  payload?: unknown
) =>
  withTransaction(async (client) => {
    const application = await assertAccess(applicationId, token);
    assertWritableApplication(application);

    let currentApplication = application;
    let sections = await getSections(client, applicationId);
    let documents = await getChecklistDocuments(client, applicationId, application.applicant_type);
    let readiness = computeReadiness(sections, documents);

    if (typeof payload !== "undefined" && payload !== null) {
      const validatedSections = await validateApplicationFormPayload(client, application, payload);
      const nextState = await persistValidatedApplicationForm(
        client,
        application,
        validatedSections
      );

      currentApplication = nextState.application;
      sections = nextState.sections;
      documents = nextState.documents;
      readiness = {
        completedSectionCount: nextState.completedSectionCount,
        documentsComplete: nextState.documentsComplete,
        readyForSubmission: nextState.readyForSubmission,
        progressPercent: nextState.progressPercent,
      };
    }

    if (!readiness.readyForSubmission) {
      throw new ApiError(400, "APPLICATION_NOT_READY_FOR_SUBMISSION", {
        sections: sections.filter((section) => !section.is_complete).map((section) => section.section_code),
      });
    }

    const documentRows = (
      await client.query<DocumentRow>(
        `
          SELECT
            id,
            application_id,
            requirement_code,
            source,
            original_name,
            mime_type,
            size_bytes,
            blob_id,
            storage_mode,
            checksum,
            upload_status,
            ocr_status,
            document_status,
            extracted_data,
            validation_results,
            uploaded_at,
            updated_at
          FROM onboard_documents
          WHERE application_id = $1
          ORDER BY requirement_code
        `,
        [applicationId]
      )
    ).rows;

    const snapshot = {
      application: toPublicApplication(currentApplication),
      sections: sections.map((section) => ({
        sectionCode: section.section_code,
        data: section.data,
        version: section.version,
        updatedAt: section.updated_at,
      })),
      documents: documentRows.map((document) => ({
        id: document.id,
        requirementCode: document.requirement_code,
        source: document.source,
        originalName: document.original_name,
        mimeType: document.mime_type,
        sizeBytes: document.size_bytes,
        uploadStatus: document.upload_status,
        documentStatus: document.document_status,
        validationResults: document.validation_results,
      })),
      submittedAt: new Date().toISOString(),
    };

    const updatedApplication = (
      await client.query<ApplicationRow>(
        `
          UPDATE onboard_applications
          SET
            status = 'submitted',
            progress_percent = 100,
            final_submission_snapshot = $2::jsonb,
            submitted_at = NOW(),
            updated_at = NOW()
          WHERE id = $1
          RETURNING ${APPLICATION_SELECT}
        `,
        [applicationId, JSON.stringify(snapshot)]
      )
    ).rows[0];

    const reviewTask = (
      await client.query<ReviewTaskRow>(
        `
          INSERT INTO onboard_review_tasks (application_id, status, reviewer_notes, decision)
          VALUES ($1, 'submitted', NULL, NULL)
          ON CONFLICT (application_id)
          DO UPDATE SET status = 'submitted', reviewer_notes = NULL, decision = NULL, updated_at = NOW()
          RETURNING id, status, reviewer_notes, decision, updated_at
        `,
        [applicationId]
      )
    ).rows[0];

    if (!updatedApplication || !reviewTask) {
      throw new ApiError(500, "FAILED_TO_SUBMIT_APPLICATION");
    }

    await recordEvent(client, applicationId, "applicant", null, "application_submitted", {
      reviewTaskId: reviewTask.id,
    });

    return {
      application: toPublicApplication(updatedApplication),
      reviewTaskId: reviewTask.id,
    };
  });
