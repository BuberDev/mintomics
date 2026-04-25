import { isPostgresConfigured as isDbConfigured } from "@/lib/db/postgres";

function hasRealEnvValue(value: string | undefined) {
  if (!value) return false;
  return !value.includes("...");
}

export function isAuthConfigured() {
  return isDbConfigured() && hasRealEnvValue(process.env.AUTH_SESSION_SECRET);
}

export function isOAuthConfigured() {
  return (
    hasRealEnvValue(process.env.GOOGLE_CLIENT_ID) &&
    hasRealEnvValue(process.env.GOOGLE_CLIENT_SECRET)
  );
}

export function getAppUrl(requestUrl?: string) {
  return process.env.NEXT_PUBLIC_APP_URL ?? requestUrl ?? "http://localhost:3000";
}

export function getSignInPath() {
  return "/sign-in";
}

export function getSignUpPath() {
  return "/sign-up";
}
