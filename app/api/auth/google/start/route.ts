import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createGoogleAuthRequest, OAUTH_RETURN_TO_COOKIE, OAUTH_STATE_COOKIE, OAUTH_VERIFIER_COOKIE } from "@/lib/auth/google";
import { assertRateLimit, buildRateLimitKey, buildRequestFingerprint } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const fingerprint = buildRequestFingerprint(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip"),
      req.headers.get("user-agent"),
    );
    await assertRateLimit({
      key: buildRateLimitKey("auth-google-start", fingerprint),
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    });

    const returnTo = req.nextUrl.searchParams.get("redirect_url") || "/generate";
    const authRequest = createGoogleAuthRequest({
      requestUrl: req.url,
      returnTo,
    });

    const response = NextResponse.redirect(authRequest.authorizationUrl, 302);
    response.cookies.set(OAUTH_STATE_COOKIE, authRequest.state, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
    });
    response.cookies.set(OAUTH_VERIFIER_COOKIE, authRequest.codeVerifier, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
    });
    response.cookies.set(OAUTH_RETURN_TO_COOKIE, encodeURIComponent(authRequest.returnTo), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : undefined;

    if (statusCode === 429) {
      return new Response(JSON.stringify({ error: "Too many Google sign-in attempts. Please wait and try again." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("[Mintomics] Failed to start Google OAuth:", error);
    return new Response(JSON.stringify({ error: "Unable to start Google sign-in." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
