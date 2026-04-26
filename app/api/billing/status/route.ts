import { getBillingState, isPostgresConfigured } from "@/lib/db/billing";
import { getCurrentUserId } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceUnavailable() {
  return new Response(
    JSON.stringify({
      error: "Postgres is not configured. Set POSTGRES_URL (and related vars) in .env.local.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export async function GET() {
  if (!isPostgresConfigured()) {
    return serviceUnavailable();
  }

  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const billing = await getBillingState(ownerId);

    return new Response(JSON.stringify({ billing }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Failed to load billing state:", error);
    return new Response(JSON.stringify({ error: "Failed to load billing state." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
