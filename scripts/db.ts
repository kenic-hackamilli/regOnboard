import { ensureDatabaseExists, ensureLocalDatabaseRunning, getLocalDatabaseStatus, stopLocalDatabase } from "../src/config/dbRuntime.js";

const command = process.argv[2] ?? "status";

const run = async () => {
  switch (command) {
    case "start": {
      const startedCluster = await ensureLocalDatabaseRunning();
      const createdDatabase = await ensureDatabaseExists();

      // eslint-disable-next-line no-console
      console.log(
        startedCluster
          ? "Local PostgreSQL cluster started."
          : "Local PostgreSQL cluster already running."
      );

      // eslint-disable-next-line no-console
      console.log(
        createdDatabase
          ? "Local onboard database created."
          : "Local onboard database already exists."
      );
      return;
    }

    case "stop": {
      const stopped = await stopLocalDatabase();
      // eslint-disable-next-line no-console
      console.log(stopped ? "Local PostgreSQL cluster stopped." : "Local PostgreSQL cluster was not running.");
      return;
    }

    case "status": {
      const status = await getLocalDatabaseStatus();
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    default:
      throw new Error(`Unsupported command "${command}". Use start, stop, or status.`);
  }
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Local database command failed", err);
  process.exit(1);
});
