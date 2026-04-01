import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  ensureDatabaseExists,
  ensureLocalDatabaseRunning,
  getDatabaseTarget,
  shouldManageLocalDatabase,
  waitForDatabase,
} from "../src/config/dbRuntime.js";
import { pool } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import { runMigrations } from "../src/config/migrations.js";
import {
  getApplicantPortalStatus,
  setApplicantPortalStatus,
} from "../src/services/portalStatusService.js";

const actorFallback = process.env.USER || process.env.USERNAME || "terminal-admin";

const printPortalStatus = async () => {
  const portalStatus = await getApplicantPortalStatus();
  const reason = portalStatus.reason || "No maintenance reason set.";

  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("Applicant Portal");
  // eslint-disable-next-line no-console
  console.log(`Status     : ${portalStatus.status}`);
  // eslint-disable-next-line no-console
  console.log(`Reason     : ${reason}`);
  // eslint-disable-next-line no-console
  console.log(`Updated by : ${portalStatus.updatedBy}`);
  // eslint-disable-next-line no-console
  console.log(`Updated at : ${portalStatus.updatedAt}`);
};

const prepareDatabase = async () => {
  const target = getDatabaseTarget();
  const autoManaged = shouldManageLocalDatabase(target);

  if (autoManaged) {
    await ensureLocalDatabaseRunning(target);
    await ensureDatabaseExists(target);
  }

  await waitForDatabase(env.DATABASE_URL, env.DB_START_TIMEOUT_MS);
  await runMigrations(env.DATABASE_URL);
};

const parseActorFlag = (args: string[]) => {
  const byIndex = args.findIndex((value) => value === "--by");
  if (byIndex < 0) {
    return actorFallback;
  }

  const nextValue = args[byIndex + 1];
  return typeof nextValue === "string" && nextValue.trim() ? nextValue.trim() : actorFallback;
};

const runCommandMode = async (args: string[]) => {
  const command = (args[0] || "status").toLowerCase();
  const actor = parseActorFlag(args);

  if (command === "status") {
    await printPortalStatus();
    return;
  }

  if (command === "activate") {
    await setApplicantPortalStatus({
      status: "active",
      updatedBy: actor,
    });
    // eslint-disable-next-line no-console
    console.log("Applicant portal marked active.");
    await printPortalStatus();
    return;
  }

  if (command === "deactivate") {
    const reason = args
      .slice(1)
      .filter((value, index, values) => {
        if (value === "--by") {
          return false;
        }

        const previousValue = values[index - 1];
        return previousValue !== "--by";
      })
      .join(" ")
      .trim();

    if (!reason) {
      throw new Error("Provide a maintenance reason. Example: npm run admin -- deactivate \"Update in progress\"");
    }

    await setApplicantPortalStatus({
      status: "inactive",
      reason,
      updatedBy: actor,
    });
    // eslint-disable-next-line no-console
    console.log("Applicant portal marked inactive.");
    await printPortalStatus();
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    // eslint-disable-next-line no-console
    console.log("Usage:");
    // eslint-disable-next-line no-console
    console.log("  npm run admin");
    // eslint-disable-next-line no-console
    console.log("  npm run admin -- status");
    // eslint-disable-next-line no-console
    console.log("  npm run admin -- activate [--by \"Your Name\"]");
    // eslint-disable-next-line no-console
    console.log("  npm run admin -- deactivate \"Update in progress\" [--by \"Your Name\"]");
    return;
  }

  throw new Error(`Unknown admin command: ${command}`);
};

const runInteractiveMode = async () => {
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      await printPortalStatus();
      // eslint-disable-next-line no-console
      console.log("");
      // eslint-disable-next-line no-console
      console.log("Choose an action:");
      // eslint-disable-next-line no-console
      console.log("  1. Refresh status");
      // eslint-disable-next-line no-console
      console.log("  2. Mark portal active");
      // eslint-disable-next-line no-console
      console.log("  3. Mark portal inactive");
      // eslint-disable-next-line no-console
      console.log("  4. Exit");

      const choice = (await rl.question("> ")).trim();

      if (choice === "4" || choice.toLowerCase() === "exit" || choice.toLowerCase() === "q") {
        return;
      }

      if (choice === "1" || choice.toLowerCase() === "refresh") {
        continue;
      }

      if (choice === "2" || choice.toLowerCase() === "active") {
        const actorInput = (await rl.question(`Updated by [${actorFallback}]: `)).trim() || actorFallback;
        await setApplicantPortalStatus({
          status: "active",
          updatedBy: actorInput,
        });
        // eslint-disable-next-line no-console
        console.log("Portal status updated.");
        continue;
      }

      if (choice === "3" || choice.toLowerCase() === "inactive") {
        const reason = (await rl.question("Reason: ")).trim();
        if (!reason) {
          // eslint-disable-next-line no-console
          console.log("A maintenance reason is required when the portal is inactive.");
          continue;
        }

        const actorInput = (await rl.question(`Updated by [${actorFallback}]: `)).trim() || actorFallback;
        await setApplicantPortalStatus({
          status: "inactive",
          reason,
          updatedBy: actorInput,
        });
        // eslint-disable-next-line no-console
        console.log("Portal status updated.");
        continue;
      }

      // eslint-disable-next-line no-console
      console.log("Choose 1, 2, 3, or 4.");
    }
  } finally {
    rl.close();
  }
};

const main = async () => {
  await prepareDatabase();

  const args = process.argv.slice(2);
  if (args.length > 0) {
    await runCommandMode(args);
    return;
  }

  await runInteractiveMode();
};

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end().catch(() => undefined);
  });
