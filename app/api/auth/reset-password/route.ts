import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { issueSessionForUser, getSafeRedirectTarget } from "@/lib/auth/session";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { findUserById, revokeAllSessionsForUser, upsertUserPasswordHash, setUserEmailVerified } from "@/lib/auth/store";
import { assertRateLimit, buildRateLimitKey, buildRequestFingerprint } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      return new Response(JSON.stringify({ error: "Authentication is not configured." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fingerprint = buildRequestFingerprint(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip"),
      req.headers.get("user-agent"),
    );
    await assertRateLimit({
      key: buildRateLimitKey("auth-reset-password", fingerprint),
      limit: 5,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });

    const body = (await req.json()) as unknown;
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid reset details.",
          issues: parsed.error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const passwordError = validatePasswordStrength(parsed.data.password);
    if (passwordError) {
      return new Response(JSON.stringify({ error: passwordError }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const redeemed = await consumeAuthToken({
      token: parsed.data.token,
      tokenType: "password_reset",
    });

    if (!redeemed?.user_id) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset link." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await findUserById(redeemed.user_id);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset link." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await upsertUserPasswordHash(user.id, hashPassword(parsed.data.password));
    await setUserEmailVerified(user.id);
    await revokeAllSessionsForUser(user.id);
    await issueSessionForUser(user.id);

    const metadataReturnTo =
      redeemed.metadata_json && typeof redeemed.metadata_json.returnTo === "string"
        ? redeemed.metadata_json.returnTo
        : null;
    const redirectUrl =
      metadataReturnTo && metadataReturnTo.startsWith("/")
        ? metadataReturnTo
        : getSafeRedirectTarget(req);

    return new Response(
      JSON.stringify({
        ok: true,
        redirectUrl,
        user,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : undefined;

    if (statusCode === 429) {
      return new Response(JSON.stringify({ error: "Too many requests." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("[Mintomics] Reset password failed:", error);
    return new Response(JSON.stringify({ error: "Unable to reset password." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
