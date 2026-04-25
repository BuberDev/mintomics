import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getAppOrigin } from "@/lib/auth/session";
import { assertRateLimit, buildRateLimitKey, buildRequestFingerprint } from "@/lib/auth/rate-limit";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { findUserById, setUserEmailVerified } from "@/lib/auth/store";
import { issueSessionForUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in?error=auth_not_configured" },
      });
    }

    const fingerprint = buildRequestFingerprint(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip"),
      req.headers.get("user-agent"),
    );
    await assertRateLimit({
      key: buildRateLimitKey("auth-verify-email", fingerprint),
      limit: 20,
      windowMs: 60 * 60 * 1000,
      blockMs: 2 * 60 * 60 * 1000,
    });

    const token = req.nextUrl.searchParams.get("token");
    const next = req.nextUrl.searchParams.get("next");

    if (!token) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in?error=missing_verification_token" },
      });
    }

    const redeemed = await consumeAuthToken({ token, tokenType: "email_verification" });

    if (!redeemed?.user_id) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in?error=invalid_or_expired_verification_link" },
      });
    }

    const user = await findUserById(redeemed.user_id);
    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in?error=verification_user_not_found" },
      });
    }

    await setUserEmailVerified(user.id);
    await issueSessionForUser(user.id);

    const metadataReturnTo =
      redeemed.metadata_json && typeof redeemed.metadata_json.returnTo === "string"
        ? redeemed.metadata_json.returnTo
        : null;
    const redirectTarget = metadataReturnTo && metadataReturnTo.startsWith("/")
      ? metadataReturnTo
      : next && next.startsWith("/")
        ? next
        : "/generate";

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTarget.startsWith("/") ? redirectTarget : "/generate",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Mintomics] Email verification failed:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `${new URL("/sign-in", getAppOrigin(req)).pathname}?error=email_verification_failed` },
    });
  }
}
