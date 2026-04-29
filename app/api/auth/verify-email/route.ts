import { NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getAppOrigin } from "@/lib/auth/session";
import { assertRateLimit, buildRateLimitKey, buildRequestFingerprint } from "@/lib/auth/rate-limit";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { findUserById, setUserEmailVerified } from "@/lib/auth/store";
import { issueSessionForUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // Send Welcome Email
    try {
      const { sendAuthEmail } = await import("@/lib/auth/mailer");
      await sendAuthEmail({
        to: user.email,
        subject: "Welcome to Mintomics",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h1 style="font-size:24px;margin:0 0 16px">Welcome to Mintomics!</h1>
            <p style="margin:0 0 16px">Your email has been verified. You're now ready to design professional tokenomics models.</p>
            <p style="margin:0 0 24px">
              <a href="${new URL("/generate", getAppOrigin(req)).toString()}" style="display:inline-block;background:#5b5bf7;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Start designing</a>
            </p>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Need help? Reply to this email and our team will jump in.</p>
          </div>
        `,
        text: `Welcome to Mintomics!\n\nYour email has been verified. Start designing your tokenomics model here: ${new URL("/generate", getAppOrigin(req)).toString()}`,
      });
    } catch (emailError) {
      console.error("[Mintomics] Failed to send welcome email:", emailError);
    }

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
