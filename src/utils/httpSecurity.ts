import crypto from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { ApiError } from "./errors.js";

const APPLICANT_SESSION_COOKIE = "onboard_applicant_session";
const ADMIN_SESSION_COOKIE = "onboard_admin_session";
const COOKIE_PROTOCOL = new URL(env.PUBLIC_BASE_URL).protocol;
const SHOULD_USE_SECURE_COOKIES =
  env.NODE_ENV === "production" || COOKIE_PROTOCOL === "https:";
const TRUSTED_ORIGIN = new URL(env.PUBLIC_BASE_URL).origin;
const ADMIN_SESSION_SECRET = env.ADMIN_SESSION_SECRET || env.ADMIN_API_TOKEN;

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

const createSignedValue = (value: string) =>
  crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(value).digest("base64url");

const createAdminSessionToken = () => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin",
      exp: Date.now() + env.ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000,
      nonce: crypto.randomBytes(16).toString("hex"),
    }),
    "utf8"
  ).toString("base64url");

  return `${payload}.${createSignedValue(payload)}`;
};

const readAdminSessionToken = (token: string) => {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createSignedValue(payload);
  const providedSignature = Buffer.from(signature, "utf8");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    providedSignature.length !== expectedSignatureBuffer.length
    || !crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      exp?: number;
    };

    if (parsed.sub !== "admin" || !Number.isFinite(parsed.exp) || Number(parsed.exp) <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const getOriginFromRequest = (request: FastifyRequest) => {
  const originHeader = request.headers.origin;
  if (typeof originHeader === "string" && originHeader.trim()) {
    return originHeader.trim();
  }

  const refererHeader = request.headers.referer;
  if (typeof refererHeader === "string" && refererHeader.trim()) {
    try {
      return new URL(refererHeader).origin;
    } catch {
      return "";
    }
  }

  return "";
};

const getExpectedRequestOrigins = (request: FastifyRequest) => {
  const forwardedHost = request.headers["x-forwarded-host"];
  const host = typeof forwardedHost === "string" && forwardedHost.trim()
    ? forwardedHost.split(",")[0]?.trim()
    : request.headers.host;
  const forwardedProto = request.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProto === "string" && forwardedProto.trim()
    ? forwardedProto.split(",")[0]?.trim()
    : request.protocol;

  return Array.from(new Set([
    TRUSTED_ORIGIN,
    host && protocol ? `${protocol}://${host}` : "",
  ].filter(Boolean)));
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

export const hasApplicantSessionCookie = (request: FastifyRequest) =>
  Boolean(getApplicantSessionToken(request));

export const setApplicantSessionCookie = (reply: FastifyReply, token: string) => {
  reply.header(
    "Set-Cookie",
    serializeCookie(APPLICANT_SESSION_COOKIE, token, {
      maxAgeSeconds: env.DRAFT_SESSION_TTL_HOURS * 60 * 60,
      path: "/portal",
    })
  );
};

export const hasAdminSession = (request: FastifyRequest) =>
  Boolean(readAdminSessionToken(parseCookieHeader(request.headers.cookie)[ADMIN_SESSION_COOKIE] || ""));

export const setAdminSessionCookie = (reply: FastifyReply) => {
  reply.header(
    "Set-Cookie",
    serializeCookie(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      maxAgeSeconds: env.ADMIN_SESSION_TTL_HOURS * 60 * 60,
      path: "/",
      sameSite: "Strict",
    })
  );
};

export const clearAdminSessionCookie = (reply: FastifyReply) => {
  reply.header(
    "Set-Cookie",
    serializeCookie(ADMIN_SESSION_COOKIE, "", {
      maxAgeSeconds: 0,
      path: "/",
      sameSite: "Strict",
    })
  );
};

export const assertTrustedRequestOrigin = (request: FastifyRequest) => {
  const origin = getOriginFromRequest(request);
  if (origin) {
    if (!getExpectedRequestOrigins(request).includes(origin)) {
      throw new ApiError(403, "UNTRUSTED_ORIGIN");
    }
    return;
  }

  const fetchSite = String(request.headers["sec-fetch-site"] || "").toLowerCase();
  if (fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none") {
    return;
  }

  if (env.NODE_ENV === "production") {
    throw new ApiError(403, "ORIGIN_REQUIRED");
  }
};

export const clearApplicantSessionCookie = (reply: FastifyReply) => {
  reply.header(
    "Set-Cookie",
    serializeCookie(APPLICANT_SESSION_COOKIE, "", {
      maxAgeSeconds: 0,
      path: "/portal",
    })
  );
};
