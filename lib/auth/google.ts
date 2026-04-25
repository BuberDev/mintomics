import { createHash, randomBytes } from "node:crypto";
import { getAppUrl, isOAuthConfigured } from "@/lib/auth/config";

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  picture: string | null;
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const OAUTH_STATE_COOKIE = "mintomics_google_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "mintomics_google_oauth_verifier";
export const OAUTH_RETURN_TO_COOKIE = "mintomics_google_oauth_return_to";

function base64UrlFromBuffer(buffer: Buffer) {
  return buffer.toString("base64url");
}

function sha256Base64Url(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

function makeRandomString(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

export function createGoogleAuthRequest({
  requestUrl,
  returnTo,
}: {
  requestUrl: string;
  returnTo: string;
}) {
  if (!isOAuthConfigured()) {
    throw new Error("Google OAuth is not configured.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${getAppUrl(requestUrl)}/api/auth/google/callback`;
  const state = makeRandomString(32);
  const codeVerifier = base64UrlFromBuffer(randomBytes(64));
  const codeChallenge = sha256Base64Url(codeVerifier);

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("access_type", "offline");

  return {
    authorizationUrl: url.toString(),
    state,
    codeVerifier,
    returnTo,
    redirectUri,
  };
}

export async function exchangeGoogleCode({
  code,
  codeVerifier,
  requestUrl,
}: {
  code: string;
  codeVerifier: string;
  requestUrl: string;
}) {
  if (!isOAuthConfigured()) {
    throw new Error("Google OAuth is not configured.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${getAppUrl(requestUrl)}/api/auth/google/callback`;

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  const tokenBody = (await tokenResponse.json()) as {
    access_token?: string;
    id_token?: string;
  };

  if (!tokenBody.access_token) {
    throw new Error("Google token response did not include an access token.");
  }

  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${tokenBody.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    const text = await userInfoResponse.text();
    throw new Error(`Google userinfo request failed: ${text}`);
  }

  const profile = (await userInfoResponse.json()) as GoogleProfile;

  if (!profile.sub || !profile.email) {
    throw new Error("Google profile is missing required fields.");
  }

  return profile;
}
