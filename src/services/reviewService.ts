import type { QueryResultRow } from "pg";
import { query, withTransaction } from "../config/db.js";
import { ApiError } from "../utils/errors.js";
import { extractDocumentSecurityScan } from "./documentSecurityService.js";

type ApplicationRow = QueryResultRow & {
  id: string;
  applicant_type: string;
  status: string;
  company_name: string | null;
  company_registration_number: string | null;
  company_tin: string | null;
  progress_percent: number | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
};

type ReviewTaskRow = QueryResultRow & {
  id: string;
  application_id: string;
  status: string;
  assigned_to: string | null;
  reviewer_notes: string | null;
  decision: string | null;
  created_at: string;
  updated_at: string;
};

type ReviewDocumentSecurityRow = QueryResultRow & {
  requirement_code: string;
  original_name: string | null;
  validation_results: Record<string, unknown> | null;
};

type DashboardCountRow = QueryResultRow & {
  applicant_type: string;
  status: string;
  count: number | string;
};

const ADMIN_DASHBOARD_STATUS_ORDER = [
  "draft",
  "collecting_documents",
  "ready_for_submission",
  "submitted",
  "in_review",
  "changes_requested",
  "approved",
  "rejected",
] as const;

type AdminDashboardStatus = (typeof ADMIN_DASHBOARD_STATUS_ORDER)[number];

export const listApplicationsForAdmin = async (status?: string) => {
  const values: unknown[] = [];
  const where = status ? `WHERE a.status = $1` : "";
  if (status) values.push(status);

  const rows = await query<
    ApplicationRow & {
      review_status: string | null;
      reviewer_notes: string | null;
      decision: string | null;
    }
  >(
    `
      SELECT
        a.id,
        a.applicant_type,
        a.status,
        a.company_name,
        a.company_registration_number,
        a.company_tin,
        a.progress_percent,
        a.created_at,
        a.updated_at,
        a.submitted_at,
        r.status AS review_status,
        r.reviewer_notes,
        r.decision
      FROM onboard_applications a
      LEFT JOIN onboard_review_tasks r ON r.application_id = a.id
      ${where}
      ORDER BY a.updated_at DESC
    `,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    applicantType: row.applicant_type,
    status: row.status,
    companyName: row.company_name,
    companyRegistrationNumber: row.company_registration_number,
    companyTin: row.company_tin,
    progressPercent: row.progress_percent ?? 0,
    submittedAt: row.submitted_at,
    reviewStatus: row.review_status,
    reviewerNotes: row.reviewer_notes,
    decision: row.decision,
    updatedAt: row.updated_at,
  }));
};

export const getApplicationsDashboardSummary = async () => {
  const countRows = await query<DashboardCountRow>(
    `
      SELECT applicant_type, status, COUNT(*)::int AS count
      FROM onboard_applications
      GROUP BY applicant_type, status
    `
  );

  const recentRows = await query<ApplicationRow>(
    `
      SELECT
        id,
        applicant_type,
        status,
        company_name,
        company_registration_number,
        company_tin,
        progress_percent,
        created_at,
        updated_at,
        submitted_at
      FROM onboard_applications
      ORDER BY created_at DESC
      LIMIT 6
    `
  );

  const byApplicantType = {
    local: 0,
    international: 0,
  };

  const byStatus: Record<AdminDashboardStatus, number> = {
    draft: 0,
    collecting_documents: 0,
    ready_for_submission: 0,
    submitted: 0,
    in_review: 0,
    changes_requested: 0,
    approved: 0,
    rejected: 0,
  };

  let totalApplications = 0;

  countRows.forEach((row) => {
    const count = Number(row.count) || 0;
    totalApplications += count;

    if (row.applicant_type === "international") {
      byApplicantType.international += count;
    } else {
      byApplicantType.local += count;
    }

    const matchedStatus = ADMIN_DASHBOARD_STATUS_ORDER.find((status) => status === row.status);
    if (matchedStatus) {
      byStatus[matchedStatus] += count;
    }
  });

  return {
    totalApplications,
    byApplicantType,
    byStatus,
    recentApplications: recentRows.map((row) => ({
      id: row.id,
      applicantType: row.applicant_type,
      status: row.status,
      companyName: row.company_name,
      progressPercent: row.progress_percent ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at,
    })),
  };
};

export const getApplicationForAdmin = async (applicationId: string) => {
  const application = (
    await query<ApplicationRow>(
      `
        SELECT
          id,
          applicant_type,
          status,
          company_name,
          company_registration_number,
          company_tin,
          progress_percent,
          created_at,
          updated_at,
          submitted_at
        FROM onboard_applications
        WHERE id = $1
        LIMIT 1
      `,
      [applicationId]
    )
  )[0];

  if (!application) {
    throw new ApiError(404, "APPLICATION_NOT_FOUND");
  }

  const sections = await query(
    `
      SELECT section_code, data, is_complete, validation_errors, version, updated_at
      FROM onboard_sections
      WHERE application_id = $1
      ORDER BY section_code
    `,
    [applicationId]
  );

  const documents = await query(
    `
      SELECT
        id,
        requirement_code,
        source,
        original_name,
        mime_type,
        size_bytes,
        upload_status,
        ocr_status,
        document_status,
        validation_results,
        uploaded_at,
        updated_at
      FROM onboard_documents
      WHERE application_id = $1
      ORDER BY requirement_code
    `,
    [applicationId]
  );

  const reviewTask = (
    await query<ReviewTaskRow>(
      `
        SELECT id, application_id, status, assigned_to, reviewer_notes, decision, created_at, updated_at
        FROM onboard_review_tasks
        WHERE application_id = $1
        LIMIT 1
      `,
      [applicationId]
    )
  )[0] ?? null;

  return {
    application,
    sections,
    documents,
    reviewTask,
  };
};

export const updateReviewState = async (params: {
  applicationId: string;
  nextStatus: "in_review" | "changes_requested" | "approved" | "rejected";
  reviewerNotes?: string | undefined;
  assignedTo?: string | undefined;
}) =>
  withTransaction(async (client) => {
    const application = (
      await client.query<ApplicationRow>(
        `
          SELECT
            id,
            applicant_type,
            status,
            company_name,
            company_registration_number,
            company_tin,
            progress_percent,
            created_at,
            updated_at,
            submitted_at
          FROM onboard_applications
          WHERE id = $1
          LIMIT 1
        `,
        [params.applicationId]
      )
    ).rows[0];

    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND");
    }

    if (params.nextStatus === "approved") {
      const securityRows = (
        await client.query<ReviewDocumentSecurityRow>(
          `
            SELECT requirement_code, original_name, validation_results
            FROM onboard_documents
            WHERE application_id = $1
            ORDER BY requirement_code
          `,
          [params.applicationId]
        )
      ).rows;

      const blockedDocuments = securityRows
        .map((row) => {
          const scan = extractDocumentSecurityScan(row.validation_results);
          if (!scan || scan.status === "clean") {
            return null;
          }

          return {
            requirementCode: row.requirement_code,
            originalName: row.original_name,
            scanStatus: scan.status,
            findings: scan.findings.map((finding) => finding.message),
          };
        })
        .filter(Boolean);

      if (blockedDocuments.length > 0) {
        throw new ApiError(409, "DOCUMENT_SECURITY_REVIEW_REQUIRED", {
          documents: blockedDocuments,
        });
      }
    }

    const task = (
      await client.query<ReviewTaskRow>(
        `
          INSERT INTO onboard_review_tasks (
            application_id,
            status,
            assigned_to,
            reviewer_notes,
            decision
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (application_id)
          DO UPDATE SET
            status = EXCLUDED.status,
            assigned_to = EXCLUDED.assigned_to,
            reviewer_notes = EXCLUDED.reviewer_notes,
            decision = EXCLUDED.decision,
            updated_at = NOW()
          RETURNING id, application_id, status, assigned_to, reviewer_notes, decision, created_at, updated_at
        `,
        [
          params.applicationId,
          params.nextStatus,
          params.assignedTo ?? null,
          params.reviewerNotes ?? null,
          params.nextStatus,
        ]
      )
    ).rows[0];

    await client.query(
      `
        UPDATE onboard_applications
        SET status = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [params.applicationId, params.nextStatus]
    );

    await client.query(
      `
        INSERT INTO onboard_events (application_id, actor_type, actor_id, event_type, payload)
        VALUES ($1, 'admin', $2, 'review_state_changed', $3::jsonb)
      `,
      [
        params.applicationId,
        params.assignedTo ?? "admin",
        JSON.stringify({
          nextStatus: params.nextStatus,
          reviewerNotes: params.reviewerNotes ?? null,
        }),
      ]
    );

    return {
      applicationId: params.applicationId,
      status: params.nextStatus,
      reviewTaskId: task?.id ?? null,
    };
  });
