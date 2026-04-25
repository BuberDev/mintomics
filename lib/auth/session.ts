import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUrl, getSignInPath } from "@/lib/auth/config";
import { generateSecureToken, sha256Base64url } from "@/lib/auth/crypto";
import {
  createSessionRecord,
  getUserBySessionToken,
  revokeSessionByTokenHash,
} from "@/lib/auth/store";

export const SESSION_COOKIE_NAME = "mintomics_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type CurrentAuth = Awaited<ReturnType<typeof getCurrentAuth>>;

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

function parseReturnTo(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/")) {
    return null;
  }

  return value;
}

export async function createSession({
  userId,
  userAgent,
  ipAddress,
}: {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  const token = generateSecureToken(48);
  const tokenHash = sha256Base64url(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await createSessionRecord({
    userId,
    tokenHash,
    userAgent,
    ipAddress,
    expiresAt,
  });

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

export async function getCurrentAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  if (!token) {
    return null;
  }

  return getUserBySessionToken(token);
}

export async function getCurrentUser() {
  const auth = await getCurrentAuth();
  return auth?.user ?? null;
}

export async function getCurrentUserId() {
  const auth = await getCurrentAuth();
  return auth?.user.id ?? null;
}

export async function requireCurrentAuth(returnTo?: string | null) {
  const auth = await getCurrentAuth();

  if (!auth) {
    const safeReturnTo = parseReturnTo(returnTo) ?? null;
    const signInUrl = safeReturnTo
      ? `${getSignInPath()}?redirect_url=${encodeURIComponent(safeReturnTo)}`
      : getSignInPath();

    redirect(signInUrl);
  }

  return auth;
}

export async function requireCurrentUserId(returnTo?: string | null) {
  const auth = await requireCurrentAuth(returnTo);
  return auth.user.id;
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function signOutCurrentSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await revokeSessionByTokenHash(sha256Base64url(token));
  }

  await clearSessionCookie();
}

export function getRequestIp() {
  const headerStore = headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null
  );
}

export function getRequestUserAgent() {
  return headers().get("user-agent");
}

export function buildReturnUrlFromRequest(request: Request) {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
}

export async function issueSessionForUser(userId: string) {
  const { token, expiresAt } = await createSession({
    userId,
    userAgent: headers().get("user-agent"),
    ipAddress: getRequestIp(),
  });

  await setSessionCookie(token, expiresAt);
  return { token, expiresAt };
}

export function getSafeRedirectTarget(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("redirect_url");

  if (returnTo && returnTo.startsWith("/")) {
    return returnTo;
  }

  return "/generate";
}

export function getAppOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  return getAppUrl(requestUrl.origin);
}
