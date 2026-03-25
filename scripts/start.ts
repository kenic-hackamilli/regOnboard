import { ensureDatabaseExists, ensureLocalDatabaseRunning, getDatabaseTarget, shouldManageLocalDatabase, waitForDatabase } from "../src/config/dbRuntime.js";
import { env } from "../src/config/env.js";
import { logger } from "../src/config/logger.js";
import { runMigrations } from "../src/config/migrations.js";
import { start } from "../src/index.js";

const bootstrap = async () => {
  const target = getDatabaseTarget();
  const autoManaged = shouldManageLocalDatabase(target);

  logger.info(
    {
      host: target.host,
      port: target.port,
      database: target.database,
      autoManaged,
      autoRunMigrations: env.AUTO_RUN_MIGRATIONS,
    },
    "Preparing backend startup"
  );

  if (autoManaged) {
    const startedCluster = await ensureLocalDatabaseRunning(target);
    logger.info(
      {
        host: target.host,
        port: target.port,
        database: target.database,
        startedCluster,
      },
      startedCluster ? "Local PostgreSQL cluster started" : "Local PostgreSQL cluster already running"
    );

    const createdDatabase = await ensureDatabaseExists(target);
    logger.info(
      {
        host: target.host,
        port: target.port,
        database: target.database,
        createdDatabase,
      },
      createdDatabase ? "Local PostgreSQL database created" : "Local PostgreSQL database already exists"
    );
  }

  logger.info(
    {
      host: target.host,
      port: target.port,
      database: target.database,
    },
    "Waiting for PostgreSQL readiness"
  );
  await waitForDatabase(env.DATABASE_URL, env.DB_START_TIMEOUT_MS);

  if (env.AUTO_RUN_MIGRATIONS) {
    const summary = await runMigrations(env.DATABASE_URL);

    logger.info(
      {
        applied: summary.applied,
        skippedCount: summary.skipped.length,
        totalMigrations: summary.total,
      },
      summary.applied.length > 0 ? "Database migrations applied" : "Database migrations already up to date"
    );
  } else {
    logger.info("Automatic database migrations are disabled");
  }

  await start();
};

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to bootstrap onboard backend");
  process.exit(1);
});
