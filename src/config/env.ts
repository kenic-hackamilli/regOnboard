import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3200),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("*"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3200"),
  ADMIN_API_TOKEN: z.string().min(8).default("change-me-in-production"),
  MAX_UPLOAD_BYTES: z.coerce.number().default(15 * 1024 * 1024),
  DRAFT_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(72),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

if (data.NODE_ENV === "production" && data.ADMIN_API_TOKEN === "change-me-in-production") {
  // eslint-disable-next-line no-console
  console.error("ADMIN_API_TOKEN must be changed before running in production.");
  process.exit(1);
}

export const env = data;
export type Env = typeof env;
