import { NextRequest } from "next/server";
import { attachOAuthAccountToUser, createOAuthUser, findUserByEmail, findUserByProviderAccount } from "@/lib/auth/store";
import { exchangeGoogleCode, OAUTH_RETURN_TO_COOKIE, OAUTH_STATE_COOKIE, OAUTH_VERIFIER_COOKIE } from "@/lib/auth/google";
import { getCurrentAuth, issueSessionForUser } from "@/lib/auth/session";
import { normalizeEmail } from "@/lib/auth/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clearOAuthCookies(response: Response) {
  const cookieOptions = "Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
  response.headers.append("Set-Cookie", `${OAUTH_STATE_COOKIE}=; ${cookieOptions}`);
  response.headers.append("Set-Cookie", `${OAUTH_VERIFIER_COOKIE}=; ${cookieOptions}`);
  response.headers.append("Set-Cookie", `${OAUTH_RETURN_TO_COOKIE}=; ${cookieOptions}`);
}

export async function GET(req: NextRequest) {
  try {
    const state = req.nextUrl.searchParams.get("state");
    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");

    if (error) {
      const failure = new Response(null, {
        status: 302,
        headers: { Location: `/sign-in?error=${encodeURIComponent(error)}` },
      });
      clearOAuthCookies(failure);
      return failure;
    }

    if (!state || !code) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in?error=missing_google_auth_parameters" },
      });
    }

    const storedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
    const codeVerifier = req.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
    const storedReturnTo = req.cookies.get(OAUTH_RETURN_TO_COOKIE)?.value ?? "/generate";
    const returnTo = storedReturnTo === "__link__" ? "/account?linked=google" : decodeURIComponent(storedReturnTo);

    if (!storedState || !codeVerifier || storedState !== state) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in?error=invalid_google_state" },
      });
    }

    const profile = await exchangeGoogleCode({
      code,
      codeVerifier,
      requestUrl: req.url,
    });

    const normalizedEmail = normalizeEmail(profile.email);
    const currentAuth = await getCurrentAuth();
    let user = await findUserByProviderAccount("google", profile.sub);

    if (currentAuth?.user) {
      const currentEmail = normalizeEmail(currentAuth.user.email);
      if (currentEmail !== normalizedEmail) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/account?error=google_email_mismatch",
          },
        });
      }

      await attachOAuthAccountToUser({
        userId: currentAuth.user.id,
        provider: "google",
        providerAccountId: profile.sub,
        providerEmail: profile.email,
        avatarUrl: profile.picture,
      });
      user = currentAuth.user;
    }

    if (!user) {
      const existingUser = await findUserByEmail(normalizedEmail);

      if (existingUser) {
        await attachOAuthAccountToUser({
          userId: existingUser.id,
          provider: "google",
          providerAccountId: profile.sub,
          providerEmail: profile.email,
          avatarUrl: profile.picture,
        });
        user = existingUser;
      } else {
        user = await createOAuthUser({
          provider: "google",
          providerAccountId: profile.sub,
          email: normalizedEmail,
          displayName: profile.name,
          avatarUrl: profile.picture,
          providerEmail: profile.email,
        });
      }
    }

    const session = await issueSessionForUser(user.id);
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: returnTo.startsWith("/") ? returnTo : "/generate",
      },
    });
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error("[Mintomics] Google callback failed:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: "/sign-in?error=google_sign_in_failed" },
    });
  }
}
