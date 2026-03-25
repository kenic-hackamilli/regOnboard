import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { Client } from "pg";
import { env } from "./env.js";

const DEFAULT_POSTGRES_PORT = 5432;
const DEFAULT_POSTGRES_DB = "postgres";

export type DatabaseTarget = {
  connectionString: string;
  maintenanceConnectionString: string;
  host: string;
  port: number;
  database: string;
  username: string;
  isLocalHost: boolean;
};

const resolveRuntimePath = (targetPath: string) => path.resolve(process.cwd(), targetPath);

const isLoopbackHost = (host: string) => ["127.0.0.1", "localhost", "::1"].includes(host);

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const summarizeError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const escapePostgresIdentifier = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;

const runBinary = async (command: string, args: string[]) => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            `Required PostgreSQL binary "${command}" was not found in PATH. Install PostgreSQL server tools or set LOCAL_DB_AUTO_START=false and point DATABASE_URL to an existing PostgreSQL server.`
          )
        );
        return;
      }

      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const output = [stderr.trim(), stdout.trim()].filter(Boolean).join("\n");
      reject(new Error(output || `${command} exited with code ${code ?? "unknown"}.`));
    });
  });
};

const probeDatabase = async (connectionString: string) => {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: Math.min(env.DB_POOL_CONNECTION_TIMEOUT_MS, 2000),
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
};

export const getDatabaseTarget = (connectionString = env.DATABASE_URL): DatabaseTarget => {
  const url = new URL(connectionString);

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL must use the postgres:// or postgresql:// protocol.");
  }

  const database = url.pathname.replace(/^\//, "") || DEFAULT_POSTGRES_DB;
  const host = url.hostname || "127.0.0.1";
  const port = url.port ? Number(url.port) : DEFAULT_POSTGRES_PORT;
  const username = decodeURIComponent(url.username || "postgres");
  const maintenanceUrl = new URL(url.toString());
  maintenanceUrl.pathname = `/${DEFAULT_POSTGRES_DB}`;

  return {
    connectionString: url.toString(),
    maintenanceConnectionString: maintenanceUrl.toString(),
    host,
    port,
    database,
    username,
    isLocalHost: isLoopbackHost(host),
  };
};

export const shouldManageLocalDatabase = (target = getDatabaseTarget()) =>
  env.LOCAL_DB_AUTO_START && target.isLocalHost;

export const waitForDatabase = async (
  connectionString = env.DATABASE_URL,
  timeoutMs = env.DB_START_TIMEOUT_MS
) => {
  const deadline = Date.now() + timeoutMs;
  let lastError: string | null = null;

  while (Date.now() < deadline) {
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: Math.min(env.DB_POOL_CONNECTION_TIMEOUT_MS, 2000),
    });

    try {
      await client.connect();
      await client.query("SELECT 1");
      return;
    } catch (error) {
      lastError = summarizeError(error);
      await delay(500);
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  throw new Error(
    lastError
      ? `Timed out waiting for PostgreSQL after ${timeoutMs}ms: ${lastError}`
      : `Timed out waiting for PostgreSQL after ${timeoutMs}ms.`
  );
};

const ensureLocalClusterInitialized = async () => {
  const dataDir = resolveRuntimePath(env.LOCAL_DB_DATA_DIR);
  const versionFile = path.join(dataDir, "PG_VERSION");

  if (fs.existsSync(versionFile)) {
    return;
  }

  await fs.promises.mkdir(path.dirname(dataDir), { recursive: true });
  await runBinary("initdb", [
    "-D",
    dataDir,
    "-U",
    "postgres",
    "-A",
    "trust",
    "--encoding=UTF8",
  ]);
};

export const ensureLocalDatabaseRunning = async (target = getDatabaseTarget()) => {
  if (!shouldManageLocalDatabase(target)) {
    return false;
  }

  if (await probeDatabase(target.maintenanceConnectionString)) {
    return false;
  }

  await ensureLocalClusterInitialized();

  const socketDir = resolveRuntimePath(env.LOCAL_DB_SOCKET_DIR);
  const logPath = resolveRuntimePath(env.LOCAL_DB_LOG_PATH);

  await fs.promises.mkdir(socketDir, { recursive: true });
  await fs.promises.mkdir(path.dirname(logPath), { recursive: true });

  if (await probeDatabase(target.maintenanceConnectionString)) {
    return false;
  }

  const waitSeconds = Math.max(5, Math.ceil(env.DB_START_TIMEOUT_MS / 1000));

  try {
    await runBinary("pg_ctl", [
      "-D",
      resolveRuntimePath(env.LOCAL_DB_DATA_DIR),
      "-l",
      logPath,
      "-w",
      "-t",
      String(waitSeconds),
      "-o",
      `-p ${target.port} -k ${socketDir}`,
      "start",
    ]);
  } catch (error) {
    if (!(await probeDatabase(target.maintenanceConnectionString))) {
      throw error;
    }
  }

  await waitForDatabase(target.maintenanceConnectionString, env.DB_START_TIMEOUT_MS);
  return true;
};

export const ensureDatabaseExists = async (target = getDatabaseTarget()) => {
  if (!shouldManageLocalDatabase(target)) {
    return false;
  }

  const client = new Client({
    connectionString: target.maintenanceConnectionString,
    connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  });

  await client.connect();

  try {
    const result = await client.query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [target.database]
    );

    if (result.rows[0]?.exists) {
      return false;
    }

    await client.query(`CREATE DATABASE ${escapePostgresIdentifier(target.database)}`);
    return true;
  } finally {
    await client.end();
  }
};

export const stopLocalDatabase = async () => {
  const dataDir = resolveRuntimePath(env.LOCAL_DB_DATA_DIR);

  if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
    return false;
  }

  if (!(await probeDatabase(getDatabaseTarget().maintenanceConnectionString))) {
    return false;
  }

  await runBinary("pg_ctl", ["-D", dataDir, "stop", "-m", "fast"]);
  return true;
};

export const getLocalDatabaseStatus = async (target = getDatabaseTarget()) => ({
  autoManaged: shouldManageLocalDatabase(target),
  initialized: fs.existsSync(path.join(resolveRuntimePath(env.LOCAL_DB_DATA_DIR), "PG_VERSION")),
  reachable: await probeDatabase(target.maintenanceConnectionString),
  host: target.host,
  port: target.port,
  database: target.database,
  dataDir: resolveRuntimePath(env.LOCAL_DB_DATA_DIR),
  socketDir: resolveRuntimePath(env.LOCAL_DB_SOCKET_DIR),
  logPath: resolveRuntimePath(env.LOCAL_DB_LOG_PATH),
});
