import type { NextRequest, NextResponse } from "next/server";

export const EDIT_SESSION_COOKIE = "edit-session";
export const SESSION_TTL_MS = 30 * 60 * 1000;

function getAuthSecret(): string | undefined {
  return process.env.EDIT_AUTH_SECRET;
}

function getEditPin(): string | undefined {
  return process.env.EDIT_PIN;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function signPayload(payload: string): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("EDIT_AUTH_SECRET is not configured");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function verifyPin(pin: string): boolean {
  const expectedPin = getEditPin();
  if (!expectedPin || !pin) return false;
  return safeEqual(pin, expectedPin);
}

export async function createSessionToken(): Promise<{
  token: string;
  expiresAt: number;
}> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = await signPayload(payload);
  return { token: `${payload}.${signature}`, expiresAt };
}

export async function verifySessionToken(
  token: string | undefined
): Promise<{ valid: boolean; expiresAt?: number }> {
  if (!token || !getAuthSecret()) return { valid: false };

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return { valid: false };

  const expectedSignature = await signPayload(payload);
  if (!safeEqual(signature, expectedSignature)) return { valid: false };

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return { valid: false };
  }

  return { valid: true, expiresAt };
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<{ valid: boolean; expiresAt?: number }> {
  const token = request.cookies.get(EDIT_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: number
): void {
  response.cookies.set({
    name: EDIT_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: EDIT_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function refreshSessionCookie(
  response: NextResponse
): Promise<void> {
  const { token, expiresAt } = await createSessionToken();
  setSessionCookie(response, token, expiresAt);
}

export function isMutationExempt(pathname: string): boolean {
  const exemptPaths = [
    "/api/auth/verify-pin",
    "/api/auth/logout",
    "/api/cron/db-ping",
  ];
  return exemptPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function isMutationMethod(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method);
}
