import crypto from "node:crypto";

export const createOpaqueToken = (prefix: string) =>
  `${prefix}_${crypto.randomBytes(24).toString("base64url")}`;

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createResumeCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const createChecksum = (content: Buffer) =>
  crypto.createHash("sha256").update(content).digest("hex");

export const hoursFromNow = (hours: number) => {
  const value = new Date();
  value.setHours(value.getHours() + hours);
  return value;
};
