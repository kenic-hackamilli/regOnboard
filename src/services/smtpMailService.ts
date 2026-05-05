import net from "node:net";
import tls from "node:tls";
import { randomBytes } from "node:crypto";
import { env } from "../config/env.js";

export type MailAddress = {
  email: string;
  name?: string | null;
};

export type MailAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export type MailMessage = {
  from?: MailAddress;
  to: string[];
  subject: string;
  text: string;
  attachments?: MailAttachment[];
};

type SmtpResponse = {
  code: number;
  lines: string[];
  message: string;
};

class SmtpCommandError extends Error {
  command: string;
  response: SmtpResponse;

  constructor(command: string, response: SmtpResponse) {
    super(`SMTP command failed for ${command}: ${response.code} ${response.message}`);
    this.command = command;
    this.response = response;
  }
}

const SOCKET_END_RESPONSE_CODE = 221;
const EOL = "\r\n";
const ASCII_SANITIZE_PATTERN = /[^\x20-\x7E]/g;
const LINE_WRAP = 76;

const sanitizeHeaderValue = (value: string) =>
  String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim();

const normalizePlainText = (value: string) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

const toPrintablePdfText = (value: string) =>
  normalizePlainText(value).replace(ASCII_SANITIZE_PATTERN, "?");

const encodeHeaderValue = (value: string) => {
  const sanitized = sanitizeHeaderValue(value);
  if (!sanitized) {
    return "";
  }

  return /^[\x20-\x7E]+$/.test(sanitized)
    ? sanitized
    : `=?UTF-8?B?${Buffer.from(sanitized, "utf8").toString("base64")}?=`;
};

const wrapBase64 = (buffer: Buffer) => {
  const base64 = buffer.toString("base64");
  const chunks: string[] = [];

  for (let index = 0; index < base64.length; index += LINE_WRAP) {
    chunks.push(base64.slice(index, index + LINE_WRAP));
  }

  return chunks.join(EOL);
};

const formatAddress = (address: MailAddress) => {
  const email = sanitizeHeaderValue(address.email);
  const name = sanitizeHeaderValue(address.name || "");
  return name ? `${encodeHeaderValue(name)} <${email}>` : email;
};

const createMessageId = () => {
  const domain =
    sanitizeHeaderValue(env.MAIL_FROM_ADDRESS || "").split("@")[1]
    || new URL(env.PUBLIC_BASE_URL).hostname
    || "localhost";
  return `<${Date.now()}.${randomBytes(8).toString("hex")}@${domain}>`;
};

const createBoundary = (label: string) =>
  `----=_Onboard_${label}_${randomBytes(8).toString("hex")}`;

const dotStuffMessage = (value: string) =>
  value.replace(/(^|\r\n)\./g, "$1..");

const buildMimeMessage = (message: MailMessage) => {
  const from = message.from ?? {
    email: env.MAIL_FROM_ADDRESS || env.MAIL_USERNAME || "",
    name: env.MAIL_FROM_NAME || "Onboard Applications",
  };
  const attachments = message.attachments || [];
  const headers = [
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${createMessageId()}`,
    `From: ${formatAddress(from)}`,
    `To: ${message.to.map((entry) => sanitizeHeaderValue(entry)).join(", ")}`,
    `Subject: ${encodeHeaderValue(message.subject)}`,
    "MIME-Version: 1.0",
  ];

  if (!attachments.length) {
    return [
      ...headers,
      'Content-Type: text/plain; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64(Buffer.from(normalizePlainText(message.text), "utf8")),
      "",
    ].join(EOL);
  }

  const boundary = createBoundary("mixed");
  const parts = [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(Buffer.from(normalizePlainText(message.text), "utf8")),
  ];

  attachments.forEach((attachment) => {
    parts.push(
      `--${boundary}`,
      `Content-Type: ${sanitizeHeaderValue(attachment.contentType)}; name="${sanitizeHeaderValue(attachment.filename)}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${sanitizeHeaderValue(attachment.filename)}"`,
      "",
      wrapBase64(attachment.content)
    );
  });

  parts.push(`--${boundary}--`, "");
  return parts.join(EOL);
};

class SmtpSession {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private lineBuffer = "";
  private partialResponseCode: number | null = null;
  private partialResponseLines: string[] = [];
  private queuedResponses: SmtpResponse[] = [];
  private responseWaiters: Array<{
    resolve: (response: SmtpResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private closedError: Error | null = null;

  async connect() {
    const encryption = env.MAIL_ENCRYPTION;
    const socket =
      encryption === "ssl"
        ? await this.openSecureSocket()
        : await this.openPlainSocket();

    this.bindSocket(socket);
    await this.expectResponse([220]);
    await this.sayHello();

    if (encryption === "tls" || encryption === "starttls") {
      await this.command("STARTTLS", [220]);
      await this.upgradeSocketToTls();
      await this.sayHello();
    }

    await this.authenticate();
  }

  async send(message: MailMessage) {
    if (!this.socket) {
      throw new Error("SMTP session is not connected.");
    }

    const fromAddress = sanitizeHeaderValue(
      message.from?.email || env.MAIL_FROM_ADDRESS || env.MAIL_USERNAME || ""
    );

    await this.command(`MAIL FROM:<${fromAddress}>`, [250]);

    for (const recipient of message.to) {
      await this.command(`RCPT TO:<${sanitizeHeaderValue(recipient)}>`, [250, 251]);
    }

    await this.command("DATA", [354]);
    const mimeMessage = buildMimeMessage(message);
    await this.write(`${dotStuffMessage(mimeMessage)}${EOL}.${EOL}`);
    await this.expectResponse([250]);
  }

  async close() {
    if (!this.socket) {
      return;
    }

    try {
      await this.command("QUIT", [SOCKET_END_RESPONSE_CODE]);
    } catch {
      // Ignore close failures so the socket can still be torn down.
    } finally {
      this.socket.destroy();
      this.socket = null;
    }
  }

  private async sayHello() {
    const hostName = new URL(env.PUBLIC_BASE_URL).hostname || "localhost";
    await this.command(`EHLO ${hostName}`, [250]);
  }

  private async authenticate() {
    const username = env.MAIL_USERNAME || "";
    const password = env.MAIL_PASSWORD || "";
    const authPlainPayload = Buffer.from(`\u0000${username}\u0000${password}`, "utf8").toString("base64");

    try {
      await this.command(`AUTH PLAIN ${authPlainPayload}`, [235]);
      return;
    } catch (error) {
      if (!(error instanceof SmtpCommandError) || ![500, 502, 504].includes(error.response.code)) {
        throw error;
      }
    }

    await this.command("AUTH LOGIN", [334]);
    await this.command(Buffer.from(username, "utf8").toString("base64"), [334]);
    await this.command(Buffer.from(password, "utf8").toString("base64"), [235]);
  }

  private async command(command: string, expectedCodes: number[]) {
    await this.write(`${command}${EOL}`);
    const response = await this.expectResponse(expectedCodes);
    return response;
  }

  private async expectResponse(expectedCodes: number[]) {
    const response = await this.nextResponse();
    if (!expectedCodes.includes(response.code)) {
      throw new SmtpCommandError(expectedCodes.join("/"), response);
    }
    return response;
  }

  private async nextResponse() {
    if (this.closedError) {
      throw this.closedError;
    }

    const queuedResponse = this.queuedResponses.shift();
    if (queuedResponse) {
      return queuedResponse;
    }

    return new Promise<SmtpResponse>((resolve, reject) => {
      this.responseWaiters.push({ resolve, reject });
    });
  }

  private async write(chunk: string) {
    if (!this.socket) {
      throw new Error("SMTP socket is not available.");
    }

    await new Promise<void>((resolve, reject) => {
      this.socket?.write(chunk, "utf8", (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private openPlainSocket() {
    return new Promise<net.Socket>((resolve, reject) => {
      const socket = net.createConnection({
        host: env.MAIL_HOST,
        port: env.MAIL_PORT,
      });

      socket.setTimeout(env.MAIL_SOCKET_TIMEOUT_MS);
      socket.once("connect", () => resolve(socket));
      socket.once("error", reject);
      socket.once("timeout", () => reject(new Error("SMTP socket timed out.")));
    });
  }

  private openSecureSocket() {
    return new Promise<tls.TLSSocket>((resolve, reject) => {
      const socket = tls.connect({
        host: env.MAIL_HOST,
        port: env.MAIL_PORT,
        servername: env.MAIL_HOST,
        timeout: env.MAIL_CONNECTION_TIMEOUT_MS,
      });

      socket.setTimeout(env.MAIL_SOCKET_TIMEOUT_MS);
      socket.once("secureConnect", () => resolve(socket));
      socket.once("error", reject);
      socket.once("timeout", () => reject(new Error("SMTP TLS socket timed out.")));
    });
  }

  private async upgradeSocketToTls() {
    const currentSocket = this.socket;
    if (!currentSocket) {
      throw new Error("SMTP socket is not available for STARTTLS upgrade.");
    }

    this.unbindSocket(currentSocket);

    const secureSocket = await new Promise<tls.TLSSocket>((resolve, reject) => {
      const socket = tls.connect({
        socket: currentSocket,
        servername: env.MAIL_HOST,
        timeout: env.MAIL_CONNECTION_TIMEOUT_MS,
      });

      socket.setTimeout(env.MAIL_SOCKET_TIMEOUT_MS);
      socket.once("secureConnect", () => resolve(socket));
      socket.once("error", reject);
      socket.once("timeout", () => reject(new Error("SMTP STARTTLS upgrade timed out.")));
    });

    this.bindSocket(secureSocket);
  }

  private bindSocket(socket: net.Socket | tls.TLSSocket) {
    this.socket = socket;
    socket.on("data", this.handleData);
    socket.on("error", this.handleSocketError);
    socket.on("close", this.handleSocketClose);
    socket.on("timeout", this.handleSocketTimeout);
  }

  private unbindSocket(socket: net.Socket | tls.TLSSocket) {
    socket.off("data", this.handleData);
    socket.off("error", this.handleSocketError);
    socket.off("close", this.handleSocketClose);
    socket.off("timeout", this.handleSocketTimeout);
  }

  private handleData = (chunk: Buffer | string) => {
    this.lineBuffer += chunk.toString();
    const lines = this.lineBuffer.split(/\r?\n/);
    this.lineBuffer = lines.pop() || "";

    lines.forEach((line) => {
      if (!line) {
        return;
      }

      const match = line.match(/^(\d{3})([\s-])(.*)$/);
      if (!match) {
        return;
      }

      const code = Number(match[1]);
      const delimiter = match[2];
      const message = match[3] || "";

      if (this.partialResponseCode === null) {
        this.partialResponseCode = code;
      }

      this.partialResponseLines.push(message);

      if (delimiter === " ") {
        this.pushResponse({
          code,
          lines: [...this.partialResponseLines],
          message: this.partialResponseLines.join(" | "),
        });
        this.partialResponseCode = null;
        this.partialResponseLines = [];
      }
    });
  };

  private handleSocketError = (error: Error) => {
    this.closedError = error;
    this.flushWaiters(error);
  };

  private handleSocketClose = () => {
    const error = this.closedError || new Error("SMTP connection closed unexpectedly.");
    this.closedError = error;
    this.flushWaiters(error);
  };

  private handleSocketTimeout = () => {
    const error = new Error("SMTP connection timed out.");
    this.closedError = error;
    this.socket?.destroy(error);
    this.flushWaiters(error);
  };

  private pushResponse(response: SmtpResponse) {
    const waiter = this.responseWaiters.shift();
    if (waiter) {
      waiter.resolve(response);
      return;
    }

    this.queuedResponses.push(response);
  }

  private flushWaiters(error: Error) {
    while (this.responseWaiters.length) {
      const waiter = this.responseWaiters.shift();
      waiter?.reject(error);
    }
  }
}

export const createPlainTextPdf = (title: string, lines: string[]) => {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 48;
  const startY = 744;
  const lineHeight = 14;
  const maxLinesPerPage = 48;
  const maxCharactersPerLine = 92;

  const wrapLine = (line: string) => {
    const normalized = toPrintablePdfText(line);
    if (!normalized) {
      return [""];
    }

    const words = normalized.split(/\s+/).filter(Boolean);
    const wrapped: string[] = [];
    let currentLine = "";

    const flushCurrentLine = () => {
      if (currentLine) {
        wrapped.push(currentLine);
        currentLine = "";
      }
    };

    words.forEach((word) => {
      if (word.length > maxCharactersPerLine) {
        flushCurrentLine();
        for (let index = 0; index < word.length; index += maxCharactersPerLine) {
          wrapped.push(word.slice(index, index + maxCharactersPerLine));
        }
        return;
      }

      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length > maxCharactersPerLine) {
        flushCurrentLine();
        currentLine = word;
        return;
      }

      currentLine = candidate;
    });

    flushCurrentLine();
    return wrapped.length ? wrapped : [""];
  };

  const pdfLines = [title, "", ...lines].flatMap((entry) =>
    normalizePlainText(entry)
      .split("\n")
      .flatMap((line) => wrapLine(line))
  );
  const pages: string[][] = [];

  for (let index = 0; index < pdfLines.length; index += maxLinesPerPage) {
    pages.push(pdfLines.slice(index, index + maxLinesPerPage));
  }

  const escapePdfText = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const objectBodies = new Map<number, string>();
  let nextObjectId = 1;
  const fontObjectId = nextObjectId++;
  const contentObjectIds = pages.map(() => nextObjectId++);
  const pageObjectIds = pages.map(() => nextObjectId++);
  const pagesObjectId = nextObjectId++;
  const catalogObjectId = nextObjectId++;

  objectBodies.set(fontObjectId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines, index) => {
    const contentObjectId = contentObjectIds[index];
    const pageObjectId = pageObjectIds[index];

    if (!contentObjectId || !pageObjectId) {
      return;
    }

    const textCommands = [
      "BT",
      "/F1 11 Tf",
      `${marginX} ${startY} Td`,
      `${lineHeight} TL`,
      ...pageLines.flatMap((line, lineIndex) =>
        lineIndex === 0
          ? [`(${escapePdfText(line)}) Tj`]
          : ["T*", `(${escapePdfText(line)}) Tj`]
      ),
      "ET",
    ];
    const stream = `${textCommands.join("\n")}\n`;

    objectBodies.set(
      contentObjectId,
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`
    );
    objectBodies.set(
      pageObjectId,
      [
        "<< /Type /Page",
        `   /Parent ${pagesObjectId} 0 R`,
        `   /MediaBox [0 0 ${pageWidth} ${pageHeight}]`,
        `   /Resources << /Font << /F1 ${fontObjectId} 0 R >> >>`,
        `   /Contents ${contentObjectId} 0 R`,
        ">>",
      ].join("\n")
    );
  });

  objectBodies.set(
    pagesObjectId,
    `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>`
  );
  objectBodies.set(catalogObjectId, `<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

  let pdf = "%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n";
  const offsets: number[] = [0];

  for (let objectId = 1; objectId < nextObjectId; objectId += 1) {
    offsets[objectId] = Buffer.byteLength(pdf, "utf8");
    pdf += `${objectId} 0 obj\n${objectBodies.get(objectId) || ""}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${nextObjectId}\n0000000000 65535 f \n`;

  for (let objectId = 1; objectId < nextObjectId; objectId += 1) {
    pdf += `${String(offsets[objectId] || 0).padStart(10, "0")} 00000 n \n`;
  }

  pdf += [
    "trailer",
    `<< /Size ${nextObjectId} /Root ${catalogObjectId} 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");

  return Buffer.from(pdf, "utf8");
};

export const sendMail = async (message: MailMessage) => {
  const session = new SmtpSession();

  try {
    await session.connect();
    await session.send(message);
  } finally {
    await session.close();
  }
};
