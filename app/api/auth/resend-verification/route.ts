import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getAppOrigin } from "@/lib/auth/session";
import { sendAuthEmail } from "@/lib/auth/mailer";
import { normalizeEmail } from "@/lib/auth/password";
import { resendVerificationSchema } from "@/lib/auth/schemas";
import { findUserByEmail } from "@/lib/auth/store";
import { createAuthToken, deleteAuthTokensForEmail } from "@/lib/auth/tokens";
import { assertRateLimit, buildRateLimitKey, buildRequestFingerprint } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fingerprint = buildRequestFingerprint(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip"),
      req.headers.get("user-agent"),
    );
    await assertRateLimit({
      key: buildRateLimitKey("auth-resend-verification", fingerprint),
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });

    const body = (await req.json()) as unknown;
    const parsed = resendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await findUserByEmail(email);

    if (!user || user.emailVerifiedAt) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await deleteAuthTokensForEmail({ email, tokenType: "email_verification" });

    const token = await createAuthToken({
      userId: user.id,
      email,
      tokenType: "email_verification",
      metadata: {},
      ttlMs: 1000 * 60 * 60 * 24,
    });

    const verifyHref = new URL("/api/auth/verify-email", getAppOrigin(req));
    verifyHref.searchParams.set("token", token.token);
    verifyHref.searchParams.set("next", "/generate");

    await sendAuthEmail({
      to: email,
      subject: "Verify your Mintomics email address",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h1 style="font-size:24px;margin:0 0 16px">Verify your Mintomics email</h1>
          <p style="margin:0 0 16px">Use the button below to verify this email address and finish creating your account.</p>
          <p style="margin:0 0 24px">
            <a href="${verifyHref.toString()}" style="display:inline-block;background:#5b5bf7;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Verify email</a>
          </p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px">If the button does not work, copy this link:</p>
          <p style="word-break:break-all;color:#6b7280;font-size:14px">${verifyHref.toString()}</p>
        </div>
      `,
      text:
        `Verify your Mintomics email: ${verifyHref.toString()}\n\n` +
        "Use this link to verify your email address and finish creating your account.",
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : undefined;

    if (statusCode === 429) {
      return new Response(JSON.stringify({ ok: false, error: "Too many requests." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("[Mintomics] Resend verification failed:", error);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
