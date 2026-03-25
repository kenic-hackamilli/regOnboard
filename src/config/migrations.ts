import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { env } from "./env.js";

const MIGRATIONS_TABLE = "onboard_schema_migrations";
const migrationsDir = path.resolve(process.cwd(), "db/migrations");

type AppliedMigrationRow = {
  filename: string;
  checksum: string;
};

type MigrationFile = {
  filename: string;
  checksum: string;
  sql: string;
};

export type MigrationSummary = {
  applied: string[];
  skipped: string[];
  total: number;
};

const loadMigrationFiles = (): MigrationFile[] => {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found at ${migrationsDir}.`);
  }

  return fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((filename) => {
      const sql = fs.readFileSync(path.join(migrationsDir, filename), "utf8");

      return {
        filename,
        sql,
        checksum: crypto.createHash("sha256").update(sql).digest("hex"),
      };
    });
};

const ensureMigrationsTable = async (client: Client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      filename TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export const runMigrations = async (connectionString = env.DATABASE_URL): Promise<MigrationSummary> => {
  const client = new Client({ connectionString });
  const migrations = loadMigrationFiles();

  await client.connect();

  try {
    await ensureMigrationsTable(client);

    const existing = await client.query<AppliedMigrationRow>(
      `SELECT filename, checksum FROM ${MIGRATIONS_TABLE} ORDER BY filename`
    );

    const appliedChecksums = new Map(existing.rows.map((row) => [row.filename, row.checksum]));
    const applied: string[] = [];
    const skipped: string[] = [];

    for (const migration of migrations) {
      const existingChecksum = appliedChecksums.get(migration.filename);

      if (existingChecksum) {
        if (existingChecksum !== migration.checksum) {
          throw new Error(
            `Migration ${migration.filename} was modified after it had already been applied. Create a new migration instead of editing an existing one.`
          );
        }

        skipped.push(migration.filename);
        continue;
      }

      await client.query("BEGIN");

      try {
        await client.query(migration.sql);
        await client.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (filename, checksum) VALUES ($1, $2)`,
          [migration.filename, migration.checksum]
        );
        await client.query("COMMIT");
        applied.push(migration.filename);
      } catch (error) {
        await client.query("ROLLBACK");
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Migration ${migration.filename} failed: ${message}`);
      }
    }

    return {
      applied,
      skipped,
      total: migrations.length,
    };
  } finally {
    await client.end();
  }
};
