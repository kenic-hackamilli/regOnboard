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
import { getApplicationsDashboardSummary as getDashboardSummary } from "../src/services/reviewService.js";

const actorFallback = process.env.USER || process.env.USERNAME || "terminal-admin";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  collecting_documents: "Collecting Documents",
  ready_for_submission: "Ready for Submission",
  submitted: "Submitted",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
};

const DASHBOARD_STATUS_ORDER = [
  "draft",
  "collecting_documents",
  "ready_for_submission",
  "submitted",
  "in_review",
  "changes_requested",
  "approved",
  "rejected",
] as const;

const printLine = (value = "") => {
  // eslint-disable-next-line no-console
  console.log(value);
};

const printMetric = (label: string, value: string | number) => {
  printLine(`${label.padEnd(20)}: ${value}`);
};

const formatApplicantTypeLabel = (value: string) =>
  value === "international" ? "International" : "Local";

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return "Not yet";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const printApplicationsDashboard = async () => {
  const dashboard = await getDashboardSummary();

  printLine("");
  printLine("Applications Dashboard");
  printMetric("Total applications", dashboard.totalApplications);
  printMetric("Local", dashboard.byApplicantType.local);
  printMetric("International", dashboard.byApplicantType.international);

  printLine("");
  printLine("Status Breakdown");
  DASHBOARD_STATUS_ORDER.forEach((status) => {
    printMetric(STATUS_LABELS[status] || status, dashboard.byStatus[status]);
  });

  printLine("");
  printLine("Recent Applications");
  if (!dashboard.recentApplications.length) {
    printLine("No applications have been created yet.");
    return;
  }

  dashboard.recentApplications.forEach((application, index) => {
    const companyName = application.companyName || "Untitled applicant";
    const statusLabel = STATUS_LABELS[application.status] || application.status;
    const applicantType = formatApplicantTypeLabel(application.applicantType);
    printLine(
      `${index + 1}. ${companyName} | ${applicantType} | ${statusLabel} | Updated ${formatTimestamp(application.updatedAt)}`
    );
  });
};

const printPortalStatus = async () => {
  const portalStatus = await getApplicantPortalStatus();
  const reason = portalStatus.reason || "No maintenance reason set.";

  printLine("");
  printLine("Applicant Portal");
  printMetric("Status", portalStatus.status);
  printMetric("Reason", reason);
  printMetric("Updated by", portalStatus.updatedBy);
  printMetric("Updated at", portalStatus.updatedAt);
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
    await printApplicationsDashboard();
    await printPortalStatus();
    return;
  }

  if (command === "dashboard") {
    await printApplicationsDashboard();
    return;
  }

  if (command === "activate") {
    await setApplicantPortalStatus({
      status: "active",
      updatedBy: actor,
    });
    printLine("Applicant portal marked active.");
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
    printLine("Applicant portal marked inactive.");
    await printPortalStatus();
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    printLine("Usage:");
    printLine("  npm run admin");
    printLine("  npm run admin -- status");
    printLine("  npm run admin -- dashboard");
    printLine("  npm run admin -- activate [--by \"Your Name\"]");
    printLine("  npm run admin -- deactivate \"Update in progress\" [--by \"Your Name\"]");
    return;
  }

  throw new Error(`Unknown admin command: ${command}`);
};

const runInteractiveMode = async () => {
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      await printApplicationsDashboard();
      await printPortalStatus();
      printLine("");
      printLine("Choose an action:");
      printLine("  1. Refresh dashboard");
      printLine("  2. Mark portal active");
      printLine("  3. Mark portal inactive");
      printLine("  4. Exit");

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
        printLine("Portal status updated.");
        continue;
      }

      if (choice === "3" || choice.toLowerCase() === "inactive") {
        const reason = (await rl.question("Reason: ")).trim();
        if (!reason) {
          printLine("A maintenance reason is required when the portal is inactive.");
          continue;
        }

        const actorInput = (await rl.question(`Updated by [${actorFallback}]: `)).trim() || actorFallback;
        await setApplicantPortalStatus({
          status: "inactive",
          reason,
          updatedBy: actorInput,
        });
        printLine("Portal status updated.");
        continue;
      }

      printLine("Choose 1, 2, 3, or 4.");
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
