import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { env } from "../config/env.js";

const execFileAsync = promisify(execFile);

const PDF_ACTIVE_CONTENT_PATTERNS = [
  { code: "pdf_javascript", pattern: /\/JavaScript\b/i, message: "PDF contains JavaScript actions." },
  { code: "pdf_js", pattern: /\/JS\b/i, message: "PDF contains JS actions." },
  { code: "pdf_open_action", pattern: /\/OpenAction\b/i, message: "PDF contains automatic open actions." },
  { code: "pdf_submit_form", pattern: /\/SubmitForm\b/i, message: "PDF contains form submission actions." },
  { code: "pdf_launch", pattern: /\/Launch\b/i, message: "PDF contains launch actions." },
  { code: "pdf_embedded_file", pattern: /\/EmbeddedFile\b/i, message: "PDF contains embedded files." },
  { code: "pdf_rich_media", pattern: /\/RichMedia\b/i, message: "PDF contains rich media objects." },
  { code: "pdf_xfa", pattern: /\/XFA\b/i, message: "PDF contains XFA form content." },
] as const;

const BINARY_SCRIPT_PATTERNS = [
  { code: "embedded_html", pattern: /<!doctype html|<html\b/i, message: "Document contains HTML markup." },
  { code: "embedded_iframe", pattern: /<iframe\b/i, message: "Document contains embedded iframe markup." },
  { code: "embedded_script_tag", pattern: /<script\b/i, message: "Document contains an embedded script tag." },
  { code: "embedded_php", pattern: /<\?php/i, message: "Document contains embedded PHP markers." },
  { code: "embedded_powershell", pattern: /powershell/i, message: "Document contains PowerShell markers." },
  { code: "embedded_wscript", pattern: /wscript\.shell/i, message: "Document contains Windows script host markers." },
] as const;

type DocumentSecurityFinding = {
  code: string;
  message: string;
  severity: "warning" | "high";
};

export type DocumentSecurityScan = {
  status: "clean" | "flagged" | "failed";
  engine: string;
  findings: DocumentSecurityFinding[];
  scannedAt: string;
  externalStatus: "not_configured" | "clean" | "flagged" | "failed";
  externalOutputPreview?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const limitOutput = (value: string) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);

const tokenizeCommand = (value: string) =>
  String(value || "")
    .match(/"[^"]*"|'[^']*'|\S+/g)
    ?.map((token) => token.replace(/^['"]|['"]$/g, ""))
    .filter(Boolean) || [];

const sanitizeFilename = (value: string) => {
  const trimmed = String(value || "").trim();
  const safeName = trimmed.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return safeName || "document.bin";
};

const findHeuristicFindings = (mimeType: string, content: Buffer) => {
  const findings: DocumentSecurityFinding[] = [];
  const preview = content.toString("latin1");

  if (mimeType === "application/pdf") {
    PDF_ACTIVE_CONTENT_PATTERNS.forEach((entry) => {
      if (entry.pattern.test(preview)) {
        findings.push({
          code: entry.code,
          message: entry.message,
          severity: "high",
        });
      }
    });
  }

  if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
    BINARY_SCRIPT_PATTERNS.forEach((entry) => {
      if (entry.pattern.test(preview)) {
        findings.push({
          code: entry.code,
          message: entry.message,
          severity: mimeType === "application/pdf" ? "high" : "warning",
        });
      }
    });
  }

  return findings;
};

const runExternalScanner = async (params: {
  content: Buffer;
  filename: string;
}): Promise<{
  status: "not_configured" | "clean" | "flagged" | "failed";
  engine: string;
  findings: DocumentSecurityFinding[];
  outputPreview?: string;
}> => {
  const commandText = env.DOCUMENT_SCAN_COMMAND.trim();
  if (!commandText) {
    return {
      status: "not_configured",
      engine: "heuristic",
      findings: [],
    };
  }

  const tokens = tokenizeCommand(commandText);
  const command = tokens[0];
  const baseArgs = tokens.slice(1);
  if (!command) {
    return {
      status: "failed",
      engine: "external",
      findings: [{
        code: "scanner_command_invalid",
        message: "DOCUMENT_SCAN_COMMAND is configured but invalid.",
        severity: "warning",
      }],
    };
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "onboard-scan-"));
  const tempFilePath = path.join(tempDir, sanitizeFilename(params.filename));

  try {
    await writeFile(tempFilePath, params.content);
    const args = baseArgs.some((entry) => entry.includes("{file}"))
      ? baseArgs.map((entry) => entry.replaceAll("{file}", tempFilePath))
      : [...baseArgs, tempFilePath];

    try {
      const { stdout, stderr } = await execFileAsync(command, args, {
        timeout: env.DOCUMENT_SCAN_TIMEOUT_MS,
      });
      const combinedOutput = limitOutput(`${stdout || ""}\n${stderr || ""}`);
      if (/(FOUND|infected|malware|virus)/i.test(combinedOutput)) {
        return {
          status: "flagged",
          engine: command,
          outputPreview: combinedOutput,
          findings: [{
            code: "external_scanner_flagged",
            message: combinedOutput || "External malware scanner flagged the document.",
            severity: "high",
          }],
        };
      }

      return {
        status: "clean",
        engine: command,
        ...(combinedOutput ? { outputPreview: combinedOutput } : {}),
        findings: [],
      };
    } catch (error) {
      const scanError = error as NodeJS.ErrnoException & {
        stdout?: string;
        stderr?: string;
        code?: number | string;
      };
      const combinedOutput = limitOutput(`${scanError.stdout || ""}\n${scanError.stderr || ""}\n${scanError.message || ""}`);

      if (Number(scanError.code) === 1 || /(FOUND|infected|malware|virus)/i.test(combinedOutput)) {
        return {
          status: "flagged",
          engine: command,
          outputPreview: combinedOutput,
          findings: [{
            code: "external_scanner_flagged",
            message: combinedOutput || "External malware scanner flagged the document.",
            severity: "high",
          }],
        };
      }

      return {
        status: "failed",
        engine: command,
        outputPreview: combinedOutput,
        findings: [{
          code: "external_scanner_failed",
          message: combinedOutput || "External malware scanner could not complete.",
          severity: "warning",
        }],
      };
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
};

export const performDocumentSecurityScan = async (params: {
  filename: string;
  mimeType: string;
  content: Buffer;
}): Promise<DocumentSecurityScan> => {
  const heuristicFindings = findHeuristicFindings(params.mimeType, params.content);
  const external = await runExternalScanner(params);
  const findings = [
    ...heuristicFindings,
    ...external.findings,
  ];

  const status =
    external.status === "flagged" || heuristicFindings.length > 0
      ? "flagged"
      : external.status === "failed"
        ? "failed"
        : "clean";

  return {
    status,
    engine:
      external.status === "not_configured"
        ? "heuristic"
        : `heuristic+${external.engine}`,
    findings,
    scannedAt: new Date().toISOString(),
    externalStatus: external.status,
    ...(external.outputPreview ? { externalOutputPreview: external.outputPreview } : {}),
  };
};

export const extractDocumentSecurityScan = (validationResults: unknown): DocumentSecurityScan | null => {
  if (!isRecord(validationResults) || !isRecord(validationResults.scan)) {
    return null;
  }

  const status = String(validationResults.scan.status || "").trim();
  if (status !== "clean" && status !== "flagged" && status !== "failed") {
    return null;
  }

  const rawFindings = Array.isArray(validationResults.scan.findings)
    ? validationResults.scan.findings
    : [];

  return {
    status,
    engine: String(validationResults.scan.engine || "unknown"),
    findings: rawFindings
      .map((entry) => {
        if (isRecord(entry) && typeof entry.message === "string") {
          return {
            code: typeof entry.code === "string" ? entry.code : "finding",
            message: entry.message,
            severity: entry.severity === "high" ? "high" : "warning",
          } satisfies DocumentSecurityFinding;
        }

        if (typeof entry === "string") {
          return {
            code: "finding",
            message: entry,
            severity: "warning",
          } satisfies DocumentSecurityFinding;
        }

        return null;
      })
      .filter(Boolean) as DocumentSecurityFinding[],
    scannedAt: String(validationResults.scan.scannedAt || ""),
    externalStatus:
      validationResults.scan.externalStatus === "clean"
      || validationResults.scan.externalStatus === "flagged"
      || validationResults.scan.externalStatus === "failed"
        ? validationResults.scan.externalStatus
        : "not_configured",
    ...(typeof validationResults.scan.externalOutputPreview === "string"
      && validationResults.scan.externalOutputPreview
      ? { externalOutputPreview: validationResults.scan.externalOutputPreview }
      : {}),
  };
};
