import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getAppOrigin } from "@/lib/auth/session";
import { sendAuthEmail } from "@/lib/auth/mailer";
import { hashPassword, normalizeEmail, validatePasswordStrength } from "@/lib/auth/password";
import { signUpSchema } from "@/lib/auth/schemas";
import { createPasswordUser, findUserByEmail } from "@/lib/auth/store";
import { getSafeRedirectTarget } from "@/lib/auth/session";
import { createAuthToken, deleteAuthTokensForEmail } from "@/lib/auth/tokens";
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
      key: buildRateLimitKey("auth-signup", fingerprint),
      limit: 5,
      windowMs: 60 * 60 * 1000,
      blockMs: 6 * 60 * 60 * 1000,
    });

    const body = (await req.json()) as unknown;
    const parsed = signUpSchema.safeParse(body);
    const intent = typeof body === "object" && body !== null && (body as { intent?: unknown }).intent === "upgrade"
      ? "upgrade"
      : null;
    const cycle = typeof body === "object" && body !== null && (body as { cycle?: unknown }).cycle === "annual"
      ? "annual"
      : "monthly";
    const bodyRedirect = typeof body === "object" && body !== null && typeof (body as { redirect_url?: unknown }).redirect_url === "string"
      ? (body as { redirect_url: string }).redirect_url
      : null;

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid sign-up details.",
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

    const email = normalizeEmail(parsed.data.email);
    const existingUser = await findUserByEmail(email);
    const redirectUrl =
      intent === "upgrade"
        ? `/api/billing?cycle=${cycle}`
        : bodyRedirect && bodyRedirect.startsWith("/")
          ? bodyRedirect
          : getSafeRedirectTarget(req);

    if (existingUser?.emailVerifiedAt) {
      return new Response(JSON.stringify({ error: "An account with that email already exists." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user =
      existingUser ??
      (await createPasswordUser({
        email,
        passwordHash: hashPassword(parsed.data.password),
        displayName: parsed.data.displayName ?? null,
      }));

    const verificationRedirectUrl = `/sign-in?${new URLSearchParams({
      verification: existingUser ? "resent" : "sent",
      email,
      redirect_url: redirectUrl,
      ...(intent ? { intent } : {}),
      ...(cycle ? { cycle } : {}),
    }).toString()}`;

    await deleteAuthTokensForEmail({ email, tokenType: "email_verification" });

    const verificationToken = await createAuthToken({
      userId: user.id,
      email,
      tokenType: "email_verification",
      metadata: { returnTo: redirectUrl },
      ttlMs: 1000 * 60 * 60 * 24,
    });

    const appOrigin = getAppOrigin(req);
    const verifyHref = new URL("/api/auth/verify-email", appOrigin);
    verifyHref.searchParams.set("token", verificationToken.token);
    verifyHref.searchParams.set("next", redirectUrl);

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

    return new Response(
      JSON.stringify({
        ok: true,
        verificationRequired: true,
        redirectUrl: verificationRedirectUrl,
        user,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : undefined;

    if (statusCode === 429) {
      const retryAfterSeconds =
        typeof error === "object" && error !== null && "retryAfterSeconds" in error
          ? Number((error as { retryAfterSeconds?: unknown }).retryAfterSeconds)
          : 0;

      return new Response(JSON.stringify({ error: "Too many sign-up attempts. Please wait and try again." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...(retryAfterSeconds > 0 ? { "Retry-After": String(retryAfterSeconds) } : {}),
        },
      });
    }

    console.error("[Mintomics] Sign-up failed:", error);
    return new Response(JSON.stringify({ error: "Unable to create account." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
