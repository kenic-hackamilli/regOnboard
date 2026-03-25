import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { env } from "./env.js";
import { getDatabaseTarget } from "./dbRuntime.js";
import { logger } from "./logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  application_name: "onboard-backend",
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected PostgreSQL error");
});

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> => {
  const result = await pool.query<T>(text, params);
  return result.rows;
};

export const withTransaction = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const pingDatabase = async () => {
  const target = getDatabaseTarget();
  const startedAt = Date.now();

  try {
    const result = await query<{ server_time: string }>("SELECT NOW()::text AS server_time");

    return {
      ok: true,
      host: target.host,
      port: target.port,
      database: target.database,
      latencyMs: Date.now() - startedAt,
      serverTime: result[0]?.server_time ?? null,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      host: target.host,
      port: target.port,
      database: target.database,
      latencyMs: Date.now() - startedAt,
      serverTime: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
