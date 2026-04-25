import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type BillingCycle = "monthly" | "annual";

function getPriceId(cycle: BillingCycle) {
  return cycle === "annual"
    ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
    : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
}

function getMissingKeys(cycle: string | null) {
  const selectedCycle: BillingCycle = cycle === "annual" ? "annual" : "monthly";
  const keys: string[] = [];

  const priceId = getPriceId(selectedCycle);
  if (!priceId) {
    keys.push(
      selectedCycle === "annual"
        ? "STRIPE_PRO_ANNUAL_PRICE_ID"
        : "STRIPE_PRO_MONTHLY_PRICE_ID",
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    keys.push("STRIPE_SECRET_KEY");
  }

  return Array.from(new Set(keys));
}

export async function GET(req: NextRequest) {
  const cycle = req.nextUrl.searchParams.get("cycle");
  const selectedCycle: BillingCycle = cycle === "annual" ? "annual" : "monthly";

  const missing = getMissingKeys(cycle);
  if (missing.length > 0) {
    return Response.redirect(
      new URL(
        `/pricing?billing=missing&cycle=${encodeURIComponent(selectedCycle)}&missing=${encodeURIComponent(missing.join(","))}`,
        req.url,
      ),
      302,
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const stripe = getStripe();
  const priceId = getPriceId(selectedCycle)!;
  const ownerId = await getCurrentUserId();
  if (!ownerId) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/generate?checkout=success&cycle=${encodeURIComponent(selectedCycle)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled&cycle=${encodeURIComponent(selectedCycle)}`,
    client_reference_id: ownerId,
    metadata: {
      plan: "pro",
      cycle: selectedCycle,
      ownerId,
    },
    subscription_data: {
      metadata: {
        plan: "pro",
        cycle: selectedCycle,
        ownerId,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return new Response(JSON.stringify({ error: "Stripe checkout session did not return a URL." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return Response.redirect(session.url, 303);
}
