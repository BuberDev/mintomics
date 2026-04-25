import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { signInSchema } from "@/lib/auth/schemas";
import { findUserByEmail, findUserPasswordHash } from "@/lib/auth/store";
import { issueSessionForUser, getSafeRedirectTarget } from "@/lib/auth/session";
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
      key: buildRateLimitKey("auth-signin", fingerprint),
      limit: 10,
      windowMs: 10 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    });

    const body = (await req.json()) as unknown;
    const parsed = signInSchema.safeParse(body);
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
          error: "Invalid credentials.",
          issues: parsed.error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await findUserByEmail(email);

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const passwordHash = await findUserPasswordHash(user.id);

    if (!passwordHash || !verifyPassword(parsed.data.password, passwordHash)) {
      return new Response(JSON.stringify({ error: "Invalid email or password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!user.emailVerifiedAt) {
      return new Response(
        JSON.stringify({
          error: "Please verify your email before signing in.",
          code: "email_not_verified",
          email,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const session = await issueSessionForUser(user.id);
    const redirectUrl =
      intent === "upgrade"
        ? `/api/billing?cycle=${cycle}`
        : bodyRedirect && bodyRedirect.startsWith("/")
          ? bodyRedirect
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
      const retryAfterSeconds =
        typeof error === "object" && error !== null && "retryAfterSeconds" in error
          ? Number((error as { retryAfterSeconds?: unknown }).retryAfterSeconds)
          : 0;

      return new Response(JSON.stringify({ error: "Too many sign-in attempts. Please wait and try again." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...(retryAfterSeconds > 0 ? { "Retry-After": String(retryAfterSeconds) } : {}),
        },
      });
    }

    console.error("[Mintomics] Sign-in failed:", error);
    return new Response(JSON.stringify({ error: "Unable to sign in." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
