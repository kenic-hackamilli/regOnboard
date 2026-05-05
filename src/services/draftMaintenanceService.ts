import type { FastifyInstance } from "fastify";
import { withTransaction } from "../config/db.js";
import { env } from "../config/env.js";
import { getDraftCleanupCandidateStatuses } from "./applicationService.js";

type CleanupBatchSummary = {
  expiredSessionsRemoved: number;
  staleApplicationsRemoved: number;
  orphanBlobsRemoved: number;
  batchSize: number;
};

const cleanupBatchSize = () => env.DRAFT_CLEANUP_BATCH_SIZE;

export const cleanupStaleDraftArtifacts = async (): Promise<CleanupBatchSummary> =>
  withTransaction(async (client) => {
    const batchSize = cleanupBatchSize();

    const expiredSessionsResult = await client.query<{ id: string }>(
      `
        WITH expired_session_ids AS (
          SELECT id
          FROM onboard_draft_sessions
          WHERE expires_at IS NOT NULL
            AND expires_at <= NOW()
          ORDER BY expires_at ASC, created_at ASC
          LIMIT $1
        )
        DELETE FROM onboard_draft_sessions s
        USING expired_session_ids expired
        WHERE s.id = expired.id
        RETURNING s.id
      `,
      [batchSize]
    );

    const staleApplicationIds = (
      await client.query<{ id: string }>(
        `
          SELECT a.id
          FROM onboard_applications a
          LEFT JOIN onboard_draft_sessions s
            ON s.application_id = a.id
           AND s.token_hash IN (a.draft_token_hash, a.resume_token_hash)
           AND (s.expires_at IS NULL OR s.expires_at > NOW())
          WHERE a.status = ANY($1::text[])
          GROUP BY a.id, a.updated_at, a.created_at
          HAVING COUNT(s.id) = 0
          ORDER BY COALESCE(a.updated_at, a.created_at) ASC, a.created_at ASC
          LIMIT $2
        `,
        [getDraftCleanupCandidateStatuses(), batchSize]
      )
    ).rows.map((row) => row.id);

    const staleApplicationsResult = staleApplicationIds.length
      ? await client.query<{ id: string }>(
          `
            DELETE FROM onboard_applications
            WHERE id = ANY($1::uuid[])
            RETURNING id
          `,
          [staleApplicationIds]
        )
      : { rowCount: 0 };

    const orphanBlobResult = await client.query<{ id: string }>(
      `
        WITH orphan_blob_ids AS (
          SELECT b.id
          FROM onboard_document_blobs b
          WHERE NOT EXISTS (
            SELECT 1
            FROM onboard_documents d
            WHERE d.blob_id = b.id
          )
          ORDER BY b.created_at ASC
          LIMIT $1
        )
        DELETE FROM onboard_document_blobs b
        USING orphan_blob_ids orphaned
        WHERE b.id = orphaned.id
        RETURNING b.id
      `,
      [batchSize]
    );

    return {
      expiredSessionsRemoved: expiredSessionsResult.rowCount ?? 0,
      staleApplicationsRemoved: staleApplicationsResult.rowCount ?? 0,
      orphanBlobsRemoved: orphanBlobResult.rowCount ?? 0,
      batchSize,
    };
  });

export const registerDraftMaintenance = async (app: FastifyInstance) => {
  let cleanupTimer: NodeJS.Timeout | null = null;

  const runCleanup = async (trigger: "startup" | "interval") => {
    try {
      const result = await cleanupStaleDraftArtifacts();
      if (
        result.expiredSessionsRemoved > 0
        || result.staleApplicationsRemoved > 0
        || result.orphanBlobsRemoved > 0
      ) {
        app.log.info({ trigger, cleanup: result }, "Cleaned stale applicant draft artifacts");
      }
    } catch (error) {
      app.log.error({ err: error, trigger }, "Failed to clean stale applicant draft artifacts");
    }
  };

  await runCleanup("startup");

  if (env.DRAFT_CLEANUP_INTERVAL_MINUTES > 0) {
    cleanupTimer = setInterval(() => {
      void runCleanup("interval");
    }, env.DRAFT_CLEANUP_INTERVAL_MINUTES * 60 * 1000);
    cleanupTimer.unref?.();
  }

  app.addHook("onClose", async () => {
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  });
};
