import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getAppOrigin } from "@/lib/auth/session";
import { sendAuthEmail } from "@/lib/auth/mailer";
import { normalizeEmail } from "@/lib/auth/password";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
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
      key: buildRateLimitKey("auth-forgot-password", fingerprint),
      limit: 8,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });

    const body = (await req.json()) as unknown;
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await findUserByEmail(email);

    if (!user) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await deleteAuthTokensForEmail({ email, tokenType: "password_reset" });

    const redirectUrl =
      typeof body === "object" && body !== null && typeof (body as { redirect_url?: unknown }).redirect_url === "string" &&
      (body as { redirect_url: string }).redirect_url.startsWith("/")
        ? (body as { redirect_url: string }).redirect_url
        : "/generate";

    const token = await createAuthToken({
      userId: user.id,
      email,
      tokenType: "password_reset",
      metadata: { returnTo: redirectUrl },
      ttlMs: 1000 * 60 * 60,
    });

    const resetHref = new URL("/reset-password", getAppOrigin(req));
    resetHref.searchParams.set("token", token.token);
    resetHref.searchParams.set("email", email);

    await sendAuthEmail({
      to: email,
      subject: "Reset your Mintomics password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h1 style="font-size:24px;margin:0 0 16px">Reset your Mintomics password</h1>
          <p style="margin:0 0 16px">If you requested a password reset, use the button below to choose a new password.</p>
          <p style="margin:0 0 24px">
            <a href="${resetHref.toString()}" style="display:inline-block;background:#5b5bf7;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Reset password</a>
          </p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px">If the button does not work, copy this link:</p>
          <p style="word-break:break-all;color:#6b7280;font-size:14px">${resetHref.toString()}</p>
        </div>
      `,
      text:
        `Reset your Mintomics password: ${resetHref.toString()}\n\n` +
        "Use this link to choose a new password.",
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

    console.error("[Mintomics] Forgot password failed:", error);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
