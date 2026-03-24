import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
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
