import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers['x-draft-token']",
      "req.headers['x-resume-token']",
      "req.headers['x-admin-token']",
      "body.draftToken",
      "body.resumeToken",
      "body.token",
    ],
    remove: true,
  },
});
