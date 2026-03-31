import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { query } from "./config/db.js";
import { getDatabaseTarget } from "./config/dbRuntime.js";
import { env } from "./config/env.js";
import { registerAdminRoutes } from "./controllers/adminController.js";
import { registerHealthRoutes } from "./controllers/healthController.js";
import { registerPublicRoutes } from "./controllers/publicController.js";
import { registerRateLimit } from "./middleware/rateLimit.js";
import { registerSecurity } from "./middleware/security.js";
import { ApiError, isApiError } from "./utils/errors.js";
import { logger } from "./config/logger.js";

export const createApp = async () => {
  // JSON base64 fallback uploads need more room than the raw file size.
  const bodyLimit = Math.ceil(env.MAX_UPLOAD_BYTES * 1.5) + 1024 * 1024;
  const app = Fastify({
    logger,
    trustProxy: true,
    bodyLimit,
  });

  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: env.MAX_UPLOAD_BYTES,
    },
  });

  await registerSecurity(app as any);
  await registerRateLimit(app as any);
  await registerHealthRoutes(app as any);
  await registerPublicRoutes(app as any);
  await registerAdminRoutes(app as any);

  app.setErrorHandler((error: FastifyError | ApiError, _request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = isApiError(error) ? error.statusCode : (error.statusCode ?? 500);
    app.log.error({ err: error }, "Unhandled error");
    reply.status(statusCode).send({
      data: null,
      error: {
        message: statusCode >= 500 ? "Internal Server Error" : error.message,
        ...(isApiError(error) && error.details ? { details: error.details } : {}),
      },
    });
  });

  return app;
};

export const verifyDatabase = async () => {
  const result = await query<{ onboard_applications: string | null }>(
    "SELECT to_regclass('public.onboard_applications') AS onboard_applications"
  );

  if (!result[0]?.onboard_applications) {
    throw new Error(
      "Onboard database schema is missing. Run `npm run db:migrate` in onBoard/onboardBackend."
    );
  }
};

export const start = async () => {
  const app = await createApp();
  const databaseTarget = getDatabaseTarget();

  try {
    app.log.info(
      {
        host: databaseTarget.host,
        port: databaseTarget.port,
        database: databaseTarget.database,
      },
      "Verifying PostgreSQL connectivity"
    );
    await verifyDatabase();
    app.log.info(
      {
        host: databaseTarget.host,
        port: databaseTarget.port,
        database: databaseTarget.database,
      },
      "Database connected"
    );
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });
    app.log.info({ port: env.PORT }, "Onboard backend started");
    return app;
  } catch (err) {
    app.log.error({ err }, "Failed to start onboard backend");
    await app.close().catch(() => undefined);
    throw err;
  }
};

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  await start().catch(() => {
    process.exit(1);
  });
}
