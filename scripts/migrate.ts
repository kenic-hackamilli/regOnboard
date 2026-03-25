import { getDatabaseTarget, waitForDatabase } from "../src/config/dbRuntime.js";
import { env } from "../src/config/env.js";
import { runMigrations } from "../src/config/migrations.js";

const run = async () => {
  const target = getDatabaseTarget();

  // eslint-disable-next-line no-console
  console.log(`Waiting for PostgreSQL at ${target.host}:${target.port}/${target.database}...`);
  await waitForDatabase(env.DATABASE_URL, env.DB_START_TIMEOUT_MS);

  const summary = await runMigrations(env.DATABASE_URL);

  if (summary.applied.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`Applied ${summary.applied.length} migration(s): ${summary.applied.join(", ")}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Migrations already up to date (${summary.total} tracked).`);
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed", err);
  process.exit(1);
});
