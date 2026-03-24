import Fastify from "fastify";
import multipart from "@fastify/multipart";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { registerAdminRoutes } from "./controllers/adminController.js";
import { registerHealthRoutes } from "./controllers/healthController.js";
import { registerPublicRoutes } from "./controllers/publicController.js";
import { registerRateLimit } from "./middleware/rateLimit.js";
import { registerSecurity } from "./middleware/security.js";
import { ApiError, isApiError } from "./utils/errors.js";

const app = Fastify({
  logger,
  trustProxy: true,
  bodyLimit: env.MAX_UPLOAD_BYTES + 1024 * 1024,
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

const start = async () => {
  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });
    app.log.info({ port: env.PORT }, "Onboard backend started");
  } catch (err) {
    app.log.error({ err }, "Failed to start onboard backend");
    process.exit(1);
  }
};

await start();
