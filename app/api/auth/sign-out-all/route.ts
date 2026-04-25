import { getCurrentUserId, clearSessionCookie } from "@/lib/auth/session";
import { revokeAllSessionsForUser } from "@/lib/auth/store";

export const runtime = "nodejs";

export async function POST() {
  try {
    const userId = await getCurrentUserId();

    if (userId) {
      await revokeAllSessionsForUser(userId);
    }

    await clearSessionCookie();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Sign-out-all failed:", error);
    return new Response(JSON.stringify({ error: "Unable to sign out everywhere." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
