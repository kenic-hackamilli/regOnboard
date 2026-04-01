import crypto from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";

const APPLICANT_SESSION_COOKIE = "onboard_applicant_session";
const COOKIE_PROTOCOL = new URL(env.PUBLIC_BASE_URL).protocol;
const SHOULD_USE_SECURE_COOKIES =
  env.NODE_ENV === "production" || COOKIE_PROTOCOL === "https:";

const serializeCookie = (
  name: string,
  value: string,
  options: {
    maxAgeSeconds?: number;
    httpOnly?: boolean;
    secure?: boolean;
    path?: string;
    sameSite?: "Lax" | "Strict" | "None";
  } = {}
) => {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path || "/"}`,
    `SameSite=${options.sameSite || "Lax"}`,
  ];

  if (options.httpOnly !== false) {
    attributes.push("HttpOnly");
  }

  if (options.secure ?? SHOULD_USE_SECURE_COOKIES) {
    attributes.push("Secure");
  }

  if (typeof options.maxAgeSeconds === "number") {
    const maxAgeSeconds = Math.max(0, Math.floor(options.maxAgeSeconds));
    attributes.push(`Max-Age=${maxAgeSeconds}`);
  }

  return attributes.join("; ");
};

const parseCookieHeader = (header: string | undefined) => {
  const cookies: Record<string, string> = {};
  if (!header) {
    return cookies;
  }

  header.split(";").forEach((part) => {
    const [rawName, ...rawValueParts] = part.split("=");
    const name = String(rawName || "").trim();
    if (!name) {
      return;
    }

    const rawValue = rawValueParts.join("=").trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
  });

  return cookies;
};

export const createAssetNonce = () => crypto.randomBytes(16).toString("base64");

export const applyHtmlSecurityHeaders = (reply: FastifyReply, nonce: string) => {
  reply.header(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  reply.header("Cache-Control", "no-store");
};

export const getApplicantSessionToken = (request: FastifyRequest) =>
  parseCookieHeader(request.headers.cookie)[APPLICANT_SESSION_COOKIE] || "";

export const setApplicantSessionCookie = (reply: FastifyReply, token: string) => {
  reply.header(
    "Set-Cookie",
    serializeCookie(APPLICANT_SESSION_COOKIE, token, {
      maxAgeSeconds: env.DRAFT_SESSION_TTL_HOURS * 60 * 60,
    })
  );
};

export const clearApplicantSessionCookie = (reply: FastifyReply) => {
  reply.header(
    "Set-Cookie",
    serializeCookie(APPLICANT_SESSION_COOKIE, "", {
      maxAgeSeconds: 0,
    })
  );
};
