import { NextRequest } from "next/server";
import { resolveOwnerId } from "@/lib/auth/owner";
import { getBillingState, isPostgresConfigured } from "@/lib/db/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function serviceUnavailable() {
  return new Response(
    JSON.stringify({
      error: "Postgres is not configured. Set POSTGRES_URL (and related vars) in .env.local.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export async function GET(req: NextRequest) {
  if (!isPostgresConfigured()) {
    return serviceUnavailable();
  }

  try {
    const ownerId = await resolveOwnerId();
    const billing = await getBillingState(ownerId);

    if (!billing.stripeCustomerId) {
      return new Response(JSON.stringify({ error: "No active Stripe customer found." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: `${appUrl}/account`,
    });

    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("[Mintomics] Failed to create billing portal session:", error);
    return new Response(JSON.stringify({ error: "Failed to open billing portal." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
