import { signOutCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await signOutCurrentSession();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Sign-out failed:", error);
    return new Response(JSON.stringify({ error: "Unable to sign out." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
