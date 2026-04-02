import type { QueryResultRow } from "pg";
import { query, withTransaction } from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";
import { createChecksum } from "../utils/tokens.js";
import { getAuthorizedApplication, recalculateApplicationState } from "./applicationService.js";
import { performDocumentSecurityScan } from "./documentSecurityService.js";

type RequirementRow = QueryResultRow & {
  display_order: number;
  requirement_code: string;
  label: string;
  equivalent_label: string | null;
  description: string | null;
  is_required: boolean;
  allowed_mime_types: string[] | null;
  max_files: number;
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
  upload_status: string;
  ocr_status: string | null;
  document_status: string | null;
  validation_results: Record<string, unknown> | null;
  uploaded_at: string | null;
  updated_at: string;
};

type BlobRow = QueryResultRow & {
  id: string;
  content: Buffer;
  content_size_bytes: number;
};

const MIME_TYPE_ALIASES: Record<string, string> = {
  "application/x-pdf": "application/pdf",
  "application/acrobat": "application/pdf",
  "applications/vnd.pdf": "application/pdf",
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "text/pdf": "application/pdf",
};

const FILE_EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
};

const normalizeReportedMimeType = (mimeType: string | null | undefined) => {
  const normalized = String(mimeType || "")
    .trim()
    .toLowerCase()
    .split(";")[0];

  if (!normalized) {
    return "";
  }

  return MIME_TYPE_ALIASES[normalized] || normalized;
};

const inferMimeTypeFromFilename = (filename: string | null | undefined) => {
  const match = /\.([a-z0-9]+)$/i.exec(String(filename || "").trim());
  if (!match) {
    return "";
  }

  const extension = match[1]?.toLowerCase() || "";
  return extension ? FILE_EXTENSION_MIME_TYPES[extension] || "" : "";
};

const detectMimeTypeFromContent = (content: Buffer) => {
  if (!content.length) {
    return "";
  }

  if (
    content.length >= 5
    && content[0] === 0x25
    && content[1] === 0x50
    && content[2] === 0x44
    && content[3] === 0x46
    && content[4] === 0x2d
  ) {
    return "application/pdf";
  }

  if (
    content.length >= 3
    && content[0] === 0xff
    && content[1] === 0xd8
    && content[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    content.length >= 8
    && content[0] === 0x89
    && content[1] === 0x50
    && content[2] === 0x4e
    && content[3] === 0x47
    && content[4] === 0x0d
    && content[5] === 0x0a
    && content[6] === 0x1a
    && content[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    content.length >= 12
    && content.toString("ascii", 0, 4) === "RIFF"
    && content.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return "";
};

const resolveDocumentMimeType = (params: {
  filename: string;
  mimeType: string;
  content: Buffer;
}) => {
  const reportedMimeType = normalizeReportedMimeType(params.mimeType);
  const detectedMimeType = detectMimeTypeFromContent(params.content);
  const filenameMimeType = inferMimeTypeFromFilename(params.filename);

  const normalizedMimeType =
    detectedMimeType
    || (reportedMimeType && reportedMimeType !== "application/octet-stream" ? reportedMimeType : "")
    || filenameMimeType
    || reportedMimeType
    || "application/octet-stream";

  return {
    reportedMimeType,
    detectedMimeType,
    filenameMimeType,
    normalizedMimeType,
  };
};

const getDocumentStatusFromSecurityScan = (status: "clean" | "flagged" | "failed") => {
  if (status === "flagged") {
    return "security_review_required";
  }

  if (status === "failed") {
    return "security_scan_failed";
  }

  return "uploaded";
};

export const listDocuments = async (applicationId: string, token: string) => {
  const application = await getAuthorizedApplication(applicationId, token);
  const documents = await query<DocumentRow>(
    `
      SELECT
        d.id,
        d.application_id,
        d.requirement_code,
        d.source,
        d.original_name,
        d.mime_type,
        d.size_bytes,
        d.blob_id,
        d.upload_status,
        d.ocr_status,
        d.document_status,
        d.validation_results,
        d.uploaded_at,
        d.updated_at
      FROM onboard_documents d
      LEFT JOIN onboard_document_requirements r
        ON r.applicant_type = $2
       AND r.requirement_code = d.requirement_code
      WHERE d.application_id = $1
      ORDER BY COALESCE(r.display_order, 1000), d.requirement_code
    `,
    [applicationId, application.applicant_type]
  );

  return documents.map((document) => ({
    id: document.id,
    requirementCode: document.requirement_code,
    source: document.source,
    originalName: document.original_name,
    mimeType: document.mime_type,
    sizeBytes: document.size_bytes,
    uploadStatus: document.upload_status,
    ocrStatus: document.ocr_status,
    documentStatus: document.document_status,
    uploadedAt: document.uploaded_at,
    updatedAt: document.updated_at,
  }));
};

export const uploadDocument = async (params: {
  applicationId: string;
  token: string;
  requirementCode: string;
  source: string;
  filename: string;
  mimeType: string;
  content: Buffer;
}) =>
  withTransaction(async (client) => {
    const allowedSources = new Set(["upload", "scan", "camera"]);
    if (!allowedSources.has(params.source)) {
      throw new ApiError(400, "INVALID_DOCUMENT_SOURCE");
    }

    const application = await getAuthorizedApplication(params.applicationId, params.token);
    const contentSize = params.content.byteLength;
    if (contentSize <= 0) {
      throw new ApiError(400, "EMPTY_FILE");
    }
    if (contentSize > env.MAX_UPLOAD_BYTES) {
      throw new ApiError(413, "FILE_TOO_LARGE", {
        maxUploadBytes: env.MAX_UPLOAD_BYTES,
      });
    }

    const resolvedMime = resolveDocumentMimeType(params);

    const requirement = (
      await client.query<RequirementRow>(
        `
          SELECT requirement_code, label, equivalent_label, description, is_required, allowed_mime_types, max_files
          , display_order
          FROM onboard_document_requirements
          WHERE applicant_type = $1 AND requirement_code = $2
          LIMIT 1
        `,
        [application.applicant_type, params.requirementCode]
      )
    ).rows[0];

    if (!requirement) {
      throw new ApiError(400, "INVALID_REQUIREMENT_CODE");
    }

    if (
      requirement.allowed_mime_types?.length
      && !requirement.allowed_mime_types.includes(resolvedMime.normalizedMimeType)
    ) {
      throw new ApiError(400, "UNSUPPORTED_MIME_TYPE", {
        allowedMimeTypes: requirement.allowed_mime_types,
        detectedMimeType: resolvedMime.detectedMimeType || undefined,
        filenameMimeType: resolvedMime.filenameMimeType || undefined,
        providedMimeType: resolvedMime.reportedMimeType || undefined,
        normalizedMimeType: resolvedMime.normalizedMimeType,
      });
    }

    const checksum = createChecksum(params.content);
    const securityScan = await performDocumentSecurityScan({
      filename: params.filename,
      mimeType: resolvedMime.normalizedMimeType,
      content: params.content,
    });
    const documentStatus = getDocumentStatusFromSecurityScan(securityScan.status);

    if (securityScan.status === "failed" && env.BLOCK_UPLOADS_ON_SCAN_FAILURE) {
      throw new ApiError(503, "DOCUMENT_SCAN_UNAVAILABLE", {
        scan: securityScan,
      });
    }

    const oldDocument = (
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
            upload_status,
            ocr_status,
            document_status,
            validation_results,
            uploaded_at,
            updated_at
          FROM onboard_documents
          WHERE application_id = $1 AND requirement_code = $2
          LIMIT 1
        `,
        [params.applicationId, params.requirementCode]
      )
    ).rows[0];

    const blobRow = (
      await client.query<{ id: string }>(
        `
          INSERT INTO onboard_document_blobs (content, content_size_bytes)
          VALUES ($1, $2)
          RETURNING id
        `,
        [params.content, contentSize]
      )
    ).rows[0];

    if (!blobRow) {
      throw new ApiError(500, "FAILED_TO_CREATE_DOCUMENT_BLOB");
    }

    const document = (
      await client.query<DocumentRow>(
        `
          INSERT INTO onboard_documents (
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
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, 'postgres_bytea', $8,
            'uploaded', 'not_started', $9, '{}'::jsonb, $10::jsonb, NOW(), NOW()
          )
          ON CONFLICT (application_id, requirement_code)
          DO UPDATE SET
            source = EXCLUDED.source,
            original_name = EXCLUDED.original_name,
            mime_type = EXCLUDED.mime_type,
            size_bytes = EXCLUDED.size_bytes,
            blob_id = EXCLUDED.blob_id,
            checksum = EXCLUDED.checksum,
            upload_status = EXCLUDED.upload_status,
            ocr_status = EXCLUDED.ocr_status,
            document_status = EXCLUDED.document_status,
            validation_results = EXCLUDED.validation_results,
            uploaded_at = NOW(),
            updated_at = NOW()
          RETURNING
            id,
            application_id,
            requirement_code,
            source,
            original_name,
            mime_type,
            size_bytes,
            blob_id,
            upload_status,
            ocr_status,
            document_status,
            validation_results,
            uploaded_at,
            updated_at
        `,
        [
          params.applicationId,
          params.requirementCode,
          params.source,
          params.filename,
          resolvedMime.normalizedMimeType,
          contentSize,
          blobRow.id,
          checksum,
          documentStatus,
          JSON.stringify({
            mimeAllowed: true,
            sizeAllowed: true,
            checksum,
            ingestChannel: params.source,
            detectedMimeType: resolvedMime.detectedMimeType || null,
            filenameMimeType: resolvedMime.filenameMimeType || null,
            normalizedMimeType: resolvedMime.normalizedMimeType,
            providedMimeType: resolvedMime.reportedMimeType || null,
            scan: securityScan,
            state: "received",
          }),
        ]
      )
    ).rows[0];

    if (oldDocument?.blob_id && oldDocument.blob_id !== blobRow.id) {
      await client.query("DELETE FROM onboard_document_blobs WHERE id = $1", [oldDocument.blob_id]);
    }

    await recalculateApplicationState(client, application);

    await client.query(
      `
        INSERT INTO onboard_events (application_id, actor_type, actor_id, event_type, payload)
        VALUES ($1, 'applicant', NULL, 'document_uploaded', $2::jsonb)
      `,
      [
        params.applicationId,
        JSON.stringify({
          requirementCode: params.requirementCode,
          filename: params.filename,
          sizeBytes: contentSize,
          mimeType: resolvedMime.normalizedMimeType,
          documentStatus,
          scanStatus: securityScan.status,
        }),
      ]
    );

    if (!document) {
      throw new ApiError(500, "FAILED_TO_SAVE_DOCUMENT");
    }

    return {
      id: document.id,
      requirementCode: document.requirement_code,
      source: document.source,
      originalName: document.original_name,
      mimeType: document.mime_type,
      sizeBytes: document.size_bytes,
      uploadStatus: document.upload_status,
      documentStatus: document.document_status,
      uploadedAt: document.uploaded_at,
    };
  });

export const getDocumentForApplicant = async (
  applicationId: string,
  documentId: string,
  token: string
) => {
  await getAuthorizedApplication(applicationId, token);
  const rows = await query<
    BlobRow &
      DocumentRow & {
        original_name: string | null;
        mime_type: string | null;
      }
  >(
    `
      SELECT
        d.id,
        d.application_id,
        d.requirement_code,
        d.source,
        d.original_name,
        d.mime_type,
        d.size_bytes,
        d.blob_id,
        d.upload_status,
        d.ocr_status,
        d.document_status,
        d.validation_results,
        d.uploaded_at,
        d.updated_at,
        b.content,
        b.content_size_bytes
      FROM onboard_documents d
      JOIN onboard_document_blobs b ON b.id = d.blob_id
      WHERE d.application_id = $1 AND d.id = $2
      LIMIT 1
    `,
    [applicationId, documentId]
  );

  const document = rows[0];
  if (!document) {
    throw new ApiError(404, "DOCUMENT_NOT_FOUND");
  }

  return {
    filename: document.original_name ?? `${document.requirement_code}.bin`,
    mimeType: document.mime_type ?? "application/octet-stream",
    content: document.content,
  };
};

export const getDocumentForAdmin = async (documentId: string) => {
  const rows = await query<
    BlobRow &
      DocumentRow & {
        original_name: string | null;
        mime_type: string | null;
      }
  >(
    `
      SELECT
        d.id,
        d.application_id,
        d.requirement_code,
        d.source,
        d.original_name,
        d.mime_type,
        d.size_bytes,
        d.blob_id,
        d.upload_status,
        d.ocr_status,
        d.document_status,
        d.validation_results,
        d.uploaded_at,
        d.updated_at,
        b.content,
        b.content_size_bytes
      FROM onboard_documents d
      JOIN onboard_document_blobs b ON b.id = d.blob_id
      WHERE d.id = $1
      LIMIT 1
    `,
    [documentId]
  );

  const document = rows[0];
  if (!document) {
    throw new ApiError(404, "DOCUMENT_NOT_FOUND");
  }

  return {
    filename: document.original_name ?? `${document.requirement_code}.bin`,
    mimeType: document.mime_type ?? "application/octet-stream",
    content: document.content,
  };
};
