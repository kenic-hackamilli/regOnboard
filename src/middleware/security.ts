import type { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { env } from "../config/env.js";

const buildAllowedOrigins = () => {
  const configuredOrigins = env.CORS_ORIGIN === "*"
    ? []
    : env.CORS_ORIGIN.split(",").map((value) => value.trim()).filter(Boolean);

  const derivedOrigins = [new URL(env.PUBLIC_BASE_URL).origin];

  if (env.NODE_ENV !== "production" && env.CORS_ORIGIN === "*") {
    derivedOrigins.push(
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    );
  }

  return Array.from(new Set([...derivedOrigins, ...configuredOrigins]));
};

export const registerSecurity = async (app: FastifyInstance) => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  const allowedOrigins = buildAllowedOrigins();

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, false);
        return;
      }

      callback(null, allowedOrigins.includes(origin));
    },
    credentials: allowedOrigins.length > 0,
  });
};
