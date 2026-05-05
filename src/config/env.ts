import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const booleanFlag = z.enum(["true", "false"]).transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3200),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("*"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3200"),
  ADMIN_API_TOKEN: z.string().min(8).default("change-me-in-production"),
  ADMIN_SESSION_SECRET: z.string().min(16).optional(),
  ADMIN_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  ADMIN_PORTAL_ENABLED: booleanFlag.default("false"),
  MAX_UPLOAD_BYTES: z.coerce.number().default(15 * 1024 * 1024),
  DOCUMENT_SCAN_COMMAND: z.string().default(""),
  DOCUMENT_SCAN_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  BLOCK_UPLOADS_ON_SCAN_FAILURE: booleanFlag.default("false"),
  DRAFT_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(72),
  DRAFT_CLEANUP_INTERVAL_MINUTES: z.coerce.number().int().nonnegative().default(15),
  DRAFT_CLEANUP_BATCH_SIZE: z.coerce.number().int().positive().default(100),
  PORTAL_STATUS_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(15000),
  NOTIFICATION_EMAIL: z.string().trim().optional(),
  MAIL_MAILER: z.enum(["disabled", "smtp"]).default("disabled"),
  MAIL_HOST: z.string().trim().optional(),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_ENCRYPTION: z.enum(["none", "ssl", "starttls", "tls"]).default("tls"),
  MAIL_USERNAME: z.string().trim().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM_ADDRESS: z.string().trim().optional(),
  MAIL_FROM_NAME: z.string().trim().optional(),
  MAIL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  MAIL_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  NOTIFICATION_DISPATCH_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  NOTIFICATION_BATCH_SIZE: z.coerce.number().int().positive().default(5),
  NOTIFICATION_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  NOTIFICATION_STALE_PROCESSING_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  LOCAL_DB_AUTO_START: booleanFlag.optional(),
  AUTO_RUN_MIGRATIONS: booleanFlag.optional(),
  DB_START_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(30000),
  DB_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  LOCAL_DB_DATA_DIR: z.string().default(".pgdata"),
  LOCAL_DB_SOCKET_DIR: z.string().default(".pgsocket"),
  LOCAL_DB_LOG_PATH: z.string().default(".pglog/postgres.log"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;
const env = {
  ...data,
  LOCAL_DB_AUTO_START: data.LOCAL_DB_AUTO_START ?? data.NODE_ENV !== "production",
  AUTO_RUN_MIGRATIONS: data.AUTO_RUN_MIGRATIONS ?? data.NODE_ENV !== "production",
};

if (env.NODE_ENV === "production" && env.ADMIN_API_TOKEN === "change-me-in-production") {
  // eslint-disable-next-line no-console
  console.error("ADMIN_API_TOKEN must be changed before running in production.");
  process.exit(1);
}

if (env.MAIL_MAILER === "smtp") {
  const requiredMailConfig = [
    ["MAIL_HOST", env.MAIL_HOST],
    ["MAIL_USERNAME", env.MAIL_USERNAME],
    ["MAIL_PASSWORD", env.MAIL_PASSWORD],
    ["MAIL_FROM_ADDRESS", env.MAIL_FROM_ADDRESS],
  ].filter((entry) => !entry[1]);

  if (requiredMailConfig.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `SMTP mailer requires these environment variables: ${requiredMailConfig.map(([name]) => name).join(", ")}`
    );
    process.exit(1);
  }
}

export { env };
export type Env = typeof env;
