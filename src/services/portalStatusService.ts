import type { PoolClient } from "pg";
import { query, withTransaction } from "../config/db.js";
import { ApiError } from "../utils/errors.js";

const APPLICANT_PORTAL_KEY = "applicant_portal";
const PORTAL_STATUS_REASON_MAX_LENGTH = 240;
const PORTAL_UPDATED_BY_MAX_LENGTH = 120;

type PortalRuntimeRow = {
  portal_key: string;
  status: "active" | "inactive";
  reason: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type ApplicantPortalStatus = {
  portalKey: string;
  status: "active" | "inactive";
  reason: string;
  updatedBy: string;
  updatedAt: string;
};

const normalizeStatus = (value: string): ApplicantPortalStatus["status"] => {
  if (value === "inactive") {
    return "inactive";
  }
  if (value === "active") {
    return "active";
  }

  throw new Error("PORTAL_STATUS_INVALID");
};

const normalizeReason = (value: string, status: ApplicantPortalStatus["status"]) => {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (status === "active") {
    return "";
  }

  if (!normalized) {
    throw new Error("PORTAL_STATUS_REASON_REQUIRED");
  }

  if (normalized.length > PORTAL_STATUS_REASON_MAX_LENGTH) {
    throw new Error("PORTAL_STATUS_REASON_TOO_LONG");
  }

  return normalized;
};

const normalizeUpdatedBy = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "system";
  }

  return normalized.slice(0, PORTAL_UPDATED_BY_MAX_LENGTH);
};

const toApplicantPortalStatus = (row: PortalRuntimeRow | undefined): ApplicantPortalStatus => ({
  portalKey: APPLICANT_PORTAL_KEY,
  status: row?.status === "inactive" ? "inactive" : "active",
  reason: row?.reason ?? "",
  updatedBy: row?.updated_by ?? "system",
  updatedAt: row?.updated_at ?? new Date(0).toISOString(),
});

const getPortalRuntimeStateRow = async (client?: PoolClient) => {
  const rows = client
    ? (
        await client.query<PortalRuntimeRow>(
          `
            SELECT portal_key, status, reason, updated_by, updated_at
            FROM onboard_portal_runtime_state
            WHERE portal_key = $1
            LIMIT 1
          `,
          [APPLICANT_PORTAL_KEY]
        )
      ).rows
    : await query<PortalRuntimeRow>(
        `
          SELECT portal_key, status, reason, updated_by, updated_at
          FROM onboard_portal_runtime_state
          WHERE portal_key = $1
          LIMIT 1
        `,
        [APPLICANT_PORTAL_KEY]
      );

  return rows[0];
};

export const getApplicantPortalStatus = async (): Promise<ApplicantPortalStatus> =>
  toApplicantPortalStatus(await getPortalRuntimeStateRow());

export const setApplicantPortalStatus = async (input: {
  status: string;
  reason?: string;
  updatedBy?: string;
}) => {
  const status = normalizeStatus(input.status);
  const reason = normalizeReason(input.reason ?? "", status);
  const updatedBy = normalizeUpdatedBy(input.updatedBy ?? "");

  return withTransaction(async (client) => {
    const result = await client.query<PortalRuntimeRow>(
      `
        INSERT INTO onboard_portal_runtime_state (
          portal_key,
          status,
          reason,
          updated_by,
          updated_at
        )
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (portal_key)
        DO UPDATE SET
          status = EXCLUDED.status,
          reason = EXCLUDED.reason,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW()
        RETURNING portal_key, status, reason, updated_by, updated_at
      `,
      [
        APPLICANT_PORTAL_KEY,
        status,
        reason || null,
        updatedBy,
      ]
    );

    return toApplicantPortalStatus(result.rows[0]);
  });
};

export const assertApplicantPortalAcceptingWrites = async () => {
  const portalStatus = await getApplicantPortalStatus();
  if (portalStatus.status !== "inactive") {
    return portalStatus;
  }

  throw new ApiError(503, "PORTAL_INACTIVE", {
    status: portalStatus.status,
    reason: portalStatus.reason || "Application updates are temporarily unavailable.",
    updatedAt: portalStatus.updatedAt,
    updatedBy: portalStatus.updatedBy,
  });
};
