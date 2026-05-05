import type { FastifyInstance } from "fastify";
import type { PoolClient, QueryResultRow } from "pg";
import { query, withTransaction } from "../config/db.js";
import { env } from "../config/env.js";
import {
  FORM_SECTION_CODES,
  SECTION_FIELD_LABELS,
  SECTION_LABELS,
  type ApplicantType,
  type SectionCode,
} from "../utils/sections.js";
import { createPlainTextPdf, sendMail } from "./smtpMailService.js";

type NotificationType = "commercial_new_application" | "applicant_acknowledgement";

type SubmissionSnapshotApplication = {
  id: string;
  applicantType: ApplicantType;
  status: string;
  countryOfIncorporation: string | null;
  companyName: string | null;
  companyRegistrationNumber: string | null;
  companyTin: string | null;
  currentSection: string | null;
  progressPercent: number;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SubmissionSnapshotSection = {
  sectionCode: SectionCode;
  data: Record<string, unknown>;
  version: number;
  updatedAt: string;
};

type SubmissionSnapshotDocument = {
  id: string;
  requirementCode: string;
  label: string | null;
  equivalentLabel: string | null;
  description: string | null;
  isRequired: boolean;
  source: string;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadStatus: string;
  documentStatus: string | null;
  validationResults: Record<string, unknown> | null;
};

export type SubmissionSnapshot = {
  application: SubmissionSnapshotApplication;
  sections: SubmissionSnapshotSection[];
  documents: SubmissionSnapshotDocument[];
  submittedAt: string;
};

type SubmissionNotificationPayload = {
  reviewTaskId: string;
  snapshot: SubmissionSnapshot;
};

type EnqueueSubmissionNotificationInput = {
  applicationId: string;
  reviewTaskId: string;
  snapshot: SubmissionSnapshot;
};

type EnqueueSubmissionNotificationResult = {
  commercialRecipientCount: number;
  applicantRecipientCount: number;
  totalQueued: number;
};

type NotificationJobRow = QueryResultRow & {
  id: string;
  application_id: string;
  notification_type: NotificationType;
  recipient_email: string;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  max_attempts: number;
  next_attempt_at: string;
  processing_started_at: string | null;
  sent_at: string | null;
  last_error: string | null;
  payload: SubmissionNotificationPayload;
  created_at: string;
  updated_at: string;
};

type DispatchSummary = {
  claimed: number;
  sent: number;
  retried: number;
  failed: number;
};

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const NOTIFICATION_RETRY_BASE_MS = 30_000;
const NOTIFICATION_RETRY_MAX_MS = 30 * 60 * 1000;
const SECTION_FIELD_ORDER: Record<Exclude<SectionCode, "SECTION_G_DOCUMENTS">, string[]> = {
  SECTION_A_GENERAL_INFORMATION: [
    "nameOfApplicant",
    "companyName",
    "companyTin",
    "addressOfApplicant",
    "companyRegistrationNumber",
    "telephoneNumber",
    "emailAddress",
    "websiteUrl",
    "contactPerson",
    "contactPersonTelephoneNumber",
    "contactPersonEmailAddress",
  ],
  SECTION_B_BUSINESS_INFORMATION: [
    "experienceDescription",
    "numberOfDomainsUnderManagement",
    "averageMonthlyRegistrations",
    "otherRelatedServices",
    "managementSystems",
    "policyComplianceSystems",
    "supportSystems",
    "billingSystems",
    "complaintsSystems",
    "resellerArrangements",
    "securityCapability",
  ],
  SECTION_C_DOMAIN_ADMINISTRATION: [
    "ns1",
    "ns2",
    "adminContact",
    "adminEmail",
    "billingContact",
    "billingEmail",
  ],
  SECTION_D_BUSINESS_DEVELOPMENT: [
    "targetMarket",
    "thirdLevelDomains",
    "intendsSecondLevelSales",
    "secondLevelSalesStrategy",
    "otherRegistrarDomains",
    "projectedMonthlyKeRegistrations",
    "promotionStrategy",
    "businessLocation",
  ],
  SECTION_E_LEGAL_STRUCTURE: [
    "companyOwnership",
    "dishonestyConvictionDetails",
  ],
  SECTION_F_DECLARATION: [
    "fullLegalNameOfApplicant",
    "representativeSignature",
    "nameTitle",
    "contactPerson",
    "dateOfSignature",
  ],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeEmail = (value: string | null | undefined) => {
  const normalized = String(value || "").trim();
  if (!normalized || !EMAIL_ADDRESS_PATTERN.test(normalized)) {
    return "";
  }
  return normalized;
};

const parseNotificationRecipients = () => {
  const rawValue = env.NOTIFICATION_EMAIL || "";
  const uniqueRecipients = new Set<string>();

  rawValue
    .split(/[;,]/)
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean)
    .forEach((email) => uniqueRecipients.add(email));

  return Array.from(uniqueRecipients);
};

const formatApplicantType = (applicantType: ApplicantType) =>
  applicantType === "international" ? "International" : "Local";

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatted = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);

  return `${formatted} UTC`;
};

const formatSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
};

const formatValue = (value: unknown) => {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length ? JSON.stringify(value) : "Not provided";
  }

  if (isRecord(value)) {
    return Object.keys(value).length ? JSON.stringify(value) : "Not provided";
  }

  return "Not provided";
};

const getSectionData = (snapshot: SubmissionSnapshot, sectionCode: SectionCode) => {
  const section = snapshot.sections.find((entry) => entry.sectionCode === sectionCode);
  return isRecord(section?.data) ? section.data : {};
};

const getGeneralInformation = (snapshot: SubmissionSnapshot) =>
  getSectionData(snapshot, "SECTION_A_GENERAL_INFORMATION");

const getApplicantNameValue = (snapshot: SubmissionSnapshot) => {
  const value = getGeneralInformation(snapshot).nameOfApplicant;
  return typeof value === "string" ? value.trim() : "";
};

const getApplicantName = (snapshot: SubmissionSnapshot) =>
  getApplicantNameValue(snapshot) || "Not provided";

const getPrimaryEmail = (snapshot: SubmissionSnapshot) =>
  normalizeEmail(String(getGeneralInformation(snapshot).emailAddress || ""));

const getPrimaryPhone = (snapshot: SubmissionSnapshot) =>
  formatValue(getGeneralInformation(snapshot).telephoneNumber);

const getContactPerson = (snapshot: SubmissionSnapshot) =>
  formatValue(getGeneralInformation(snapshot).contactPerson);

const getUploadedDocumentCount = (snapshot: SubmissionSnapshot) =>
  snapshot.documents.filter((document) => document.uploadStatus === "uploaded").length;

const buildSubmissionPdfLines = (payload: SubmissionNotificationPayload) => {
  const { snapshot, reviewTaskId } = payload;
  const lines: string[] = [
    `Application ID: ${snapshot.application.id}`,
    `Review Task ID: ${reviewTaskId}`,
    `Submitted At: ${formatTimestamp(snapshot.submittedAt || snapshot.application.submittedAt)}`,
    `Applicant Type: ${formatApplicantType(snapshot.application.applicantType)}`,
    `Company Name: ${formatValue(snapshot.application.companyName)}`,
    `Country of Incorporation: ${formatValue(snapshot.application.countryOfIncorporation)}`,
    `Primary Email: ${getPrimaryEmail(snapshot) || "Not provided"}`,
    `Primary Phone: ${getPrimaryPhone(snapshot)}`,
    "",
  ];

  FORM_SECTION_CODES.forEach((sectionCode) => {
    const sectionData = getSectionData(snapshot, sectionCode);
    const fields = SECTION_FIELD_ORDER[sectionCode];

    lines.push(SECTION_LABELS[sectionCode], "");

    fields.forEach((fieldName) => {
      const label = SECTION_FIELD_LABELS[fieldName as keyof typeof SECTION_FIELD_LABELS] || fieldName;
      lines.push(`${label}: ${formatValue(sectionData[fieldName])}`);
    });

    lines.push("");
  });

  lines.push("Supporting Documents", "");

  if (!snapshot.documents.length) {
    lines.push("No documents were included in the submission snapshot.");
    return lines;
  }

  snapshot.documents.forEach((document, index) => {
    const label = document.label || document.requirementCode;
    lines.push(
      `${index + 1}. ${label}`,
      `   Requirement Code: ${document.requirementCode}`,
      `   File Name: ${document.originalName || "Not provided"}`,
      `   MIME Type: ${document.mimeType || "Not provided"}`,
      `   Size: ${formatSize(document.sizeBytes)}`,
      `   Upload Status: ${document.uploadStatus}`,
      `   Document Status: ${document.documentStatus || "Not provided"}`,
      ""
    );
  });

  return lines;
};

const buildCommercialNotificationText = (payload: SubmissionNotificationPayload) => {
  const { snapshot, reviewTaskId } = payload;

  return [
    "A new registrar onboarding application has been submitted.",
    "",
    `Application ID: ${snapshot.application.id}`,
    `Review Task ID: ${reviewTaskId}`,
    `Submitted At: ${formatTimestamp(snapshot.submittedAt || snapshot.application.submittedAt)}`,
    `Applicant Type: ${formatApplicantType(snapshot.application.applicantType)}`,
    `Company Name: ${formatValue(snapshot.application.companyName)}`,
    `Applicant Name: ${getApplicantName(snapshot)}`,
    `Primary Email: ${getPrimaryEmail(snapshot) || "Not provided"}`,
    `Primary Phone: ${getPrimaryPhone(snapshot)}`,
    `Contact Person: ${getContactPerson(snapshot)}`,
    `Country of Incorporation: ${formatValue(snapshot.application.countryOfIncorporation)}`,
    `Uploaded Documents: ${getUploadedDocumentCount(snapshot)} of ${snapshot.documents.length}`,
    "",
    "The attached PDF contains the full submission snapshot for review.",
  ].join("\n");
};

const buildApplicantAcknowledgementText = (payload: SubmissionNotificationPayload) => {
  const { snapshot } = payload;
  const applicantName = getApplicantNameValue(snapshot);

  return [
    `Dear ${applicantName || "Applicant"},`,
    "",
    "Your registrar onboarding application has been received successfully.",
    "",
    `Application ID: ${snapshot.application.id}`,
    `Submitted At: ${formatTimestamp(snapshot.submittedAt || snapshot.application.submittedAt)}`,
    `Applicant Type: ${formatApplicantType(snapshot.application.applicantType)}`,
    "",
    "Our review team is now assessing your submission. If we need any clarification or additional documentation, we will reach out using your application contact details.",
    "",
    "Thank you,",
    env.MAIL_FROM_NAME || "KeNIC Applications",
  ].join("\n");
};

const buildCommercialSubject = (payload: SubmissionNotificationPayload) => {
  const { snapshot } = payload;
  const reference =
    snapshot.application.companyName?.trim()
    || getApplicantNameValue(snapshot)
    || snapshot.application.id;
  return `New registrar application submitted: ${reference}`;
};

const buildApplicantSubject = () =>
  "We have received your KeNIC registrar application";

const computeRetryDelayMs = (attempts: number) =>
  Math.min(NOTIFICATION_RETRY_MAX_MS, NOTIFICATION_RETRY_BASE_MS * (2 ** Math.max(attempts - 1, 0)));

const truncateErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 2000);
};

const insertSystemEvent = async (
  applicationId: string,
  eventType: string,
  payload: Record<string, unknown>
) => {
  await query(
    `
      INSERT INTO onboard_events (application_id, actor_type, actor_id, event_type, payload)
      VALUES ($1, 'system', NULL, $2, $3::jsonb)
    `,
    [applicationId, eventType, JSON.stringify(payload)]
  );
};

const claimDueNotificationJobs = async (limit: number) =>
  withTransaction(async (client) => {
    const staleProcessingThreshold = new Date(
      Date.now() - env.NOTIFICATION_STALE_PROCESSING_MS
    ).toISOString();

    return (
      await client.query<NotificationJobRow>(
        `
          WITH claimable_jobs AS (
            SELECT id
            FROM onboard_notification_jobs
            WHERE attempts < max_attempts
              AND (
                (status = 'pending' AND next_attempt_at <= NOW())
                OR (
                  status = 'processing'
                  AND processing_started_at IS NOT NULL
                  AND processing_started_at <= $2::timestamptz
                )
              )
            ORDER BY next_attempt_at ASC, created_at ASC
            LIMIT $1
            FOR UPDATE SKIP LOCKED
          )
          UPDATE onboard_notification_jobs jobs
          SET
            status = 'processing',
            attempts = jobs.attempts + 1,
            processing_started_at = NOW(),
            updated_at = NOW(),
            last_error = NULL
          FROM claimable_jobs
          WHERE jobs.id = claimable_jobs.id
          RETURNING jobs.*
        `,
        [limit, staleProcessingThreshold]
      )
    ).rows;
  });

const markNotificationJobSent = async (job: NotificationJobRow) => {
  await query(
    `
      UPDATE onboard_notification_jobs
      SET
        status = 'sent',
        sent_at = NOW(),
        processing_started_at = NULL,
        last_error = NULL,
        updated_at = NOW()
      WHERE id = $1
    `,
    [job.id]
  );

  await insertSystemEvent(job.application_id, "submission_notification_sent", {
    jobId: job.id,
    notificationType: job.notification_type,
    recipientEmail: job.recipient_email,
  });
};

const markNotificationJobFailed = async (job: NotificationJobRow, error: unknown) => {
  const lastError = truncateErrorMessage(error);
  const permanentFailure = job.attempts >= job.max_attempts;

  await query(
    `
      UPDATE onboard_notification_jobs
      SET
        status = $2,
        next_attempt_at = $3,
        processing_started_at = NULL,
        last_error = $4,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      job.id,
      permanentFailure ? "failed" : "pending",
      new Date(Date.now() + computeRetryDelayMs(job.attempts)).toISOString(),
      lastError,
    ]
  );

  if (permanentFailure) {
    await insertSystemEvent(job.application_id, "submission_notification_failed", {
      jobId: job.id,
      notificationType: job.notification_type,
      recipientEmail: job.recipient_email,
      attempts: job.attempts,
      error: lastError,
    });
  }

  return permanentFailure;
};

const deliverNotificationJob = async (job: NotificationJobRow) => {
  if (env.MAIL_MAILER !== "smtp") {
    throw new Error("SMTP mail delivery is disabled.");
  }

  const payload = job.payload;
  const snapshot = payload.snapshot;

  if (job.notification_type === "commercial_new_application") {
    const attachment = {
      filename: `registrar-application-${snapshot.application.id}.pdf`,
      contentType: "application/pdf",
      content: createPlainTextPdf(
        "KeNIC Registrar Application Submission",
        buildSubmissionPdfLines(payload)
      ),
    };

    await sendMail({
      to: [job.recipient_email],
      subject: buildCommercialSubject(payload),
      text: buildCommercialNotificationText(payload),
      attachments: [attachment],
    });
    return;
  }

  await sendMail({
    to: [job.recipient_email],
    subject: buildApplicantSubject(),
    text: buildApplicantAcknowledgementText(payload),
  });
};

export const enqueueSubmissionNotifications = async (
  client: PoolClient,
  input: EnqueueSubmissionNotificationInput
): Promise<EnqueueSubmissionNotificationResult> => {
  if (env.MAIL_MAILER !== "smtp") {
    return {
      commercialRecipientCount: 0,
      applicantRecipientCount: 0,
      totalQueued: 0,
    };
  }

  const commercialRecipients = parseNotificationRecipients();
  const applicantRecipient = getPrimaryEmail(input.snapshot);
  const payload = JSON.stringify({
    reviewTaskId: input.reviewTaskId,
    snapshot: input.snapshot,
  } satisfies SubmissionNotificationPayload);
  let commercialRecipientCount = 0;
  let applicantRecipientCount = 0;

  for (const recipient of commercialRecipients) {
    await client.query(
      `
        INSERT INTO onboard_notification_jobs (
          application_id,
          notification_type,
          recipient_email,
          max_attempts,
          payload
        )
        VALUES ($1, 'commercial_new_application', $2, $3, $4::jsonb)
      `,
      [input.applicationId, recipient, env.NOTIFICATION_MAX_ATTEMPTS, payload]
    );
    commercialRecipientCount += 1;
  }

  if (applicantRecipient) {
    await client.query(
      `
        INSERT INTO onboard_notification_jobs (
          application_id,
          notification_type,
          recipient_email,
          max_attempts,
          payload
        )
        VALUES ($1, 'applicant_acknowledgement', $2, $3, $4::jsonb)
      `,
      [input.applicationId, applicantRecipient, env.NOTIFICATION_MAX_ATTEMPTS, payload]
    );
    applicantRecipientCount = 1;
  }

  return {
    commercialRecipientCount,
    applicantRecipientCount,
    totalQueued: commercialRecipientCount + applicantRecipientCount,
  };
};

export const dispatchDueSubmissionNotifications = async (): Promise<DispatchSummary> => {
  const summary: DispatchSummary = {
    claimed: 0,
    sent: 0,
    retried: 0,
    failed: 0,
  };

  if (env.MAIL_MAILER !== "smtp") {
    return summary;
  }

  while (true) {
    const jobs = await claimDueNotificationJobs(env.NOTIFICATION_BATCH_SIZE);
    if (!jobs.length) {
      return summary;
    }

    summary.claimed += jobs.length;

    for (const job of jobs) {
      try {
        await deliverNotificationJob(job);
        await markNotificationJobSent(job);
        summary.sent += 1;
      } catch (error) {
        const failedPermanently = await markNotificationJobFailed(job, error);
        if (failedPermanently) {
          summary.failed += 1;
        } else {
          summary.retried += 1;
        }
      }
    }

    if (jobs.length < env.NOTIFICATION_BATCH_SIZE) {
      return summary;
    }
  }
};

export const registerSubmissionNotificationDispatch = async (app: FastifyInstance) => {
  if (env.MAIL_MAILER !== "smtp") {
    app.log.info("Submission notification dispatcher is disabled because MAIL_MAILER is not smtp");
    return;
  }

  let dispatchTimer: NodeJS.Timeout | null = null;
  let dispatchInFlight = false;

  const runDispatch = async (trigger: "startup" | "interval") => {
    if (dispatchInFlight) {
      return;
    }

    dispatchInFlight = true;

    try {
      const summary = await dispatchDueSubmissionNotifications();
      if (summary.claimed > 0) {
        app.log.info({ trigger, notifications: summary }, "Processed submission notification jobs");
      }
    } catch (error) {
      app.log.error({ err: error, trigger }, "Failed to process submission notification jobs");
    } finally {
      dispatchInFlight = false;
    }
  };

  await runDispatch("startup");

  dispatchTimer = setInterval(() => {
    void runDispatch("interval");
  }, env.NOTIFICATION_DISPATCH_INTERVAL_MS);
  dispatchTimer.unref?.();

  app.addHook("onClose", async () => {
    if (dispatchTimer) {
      clearInterval(dispatchTimer);
      dispatchTimer = null;
    }
  });
};
