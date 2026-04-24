import { NextRequest } from "next/server";
import { resolveOwnerId } from "@/lib/auth/owner";
import { upsertBillingState } from "@/lib/db/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type BillingCycle = "monthly" | "annual";

function toBillingCycle(value: unknown): BillingCycle {
  return value === "annual" ? "annual" : "monthly";
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Missing session_id." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== "subscription") {
      return new Response(JSON.stringify({ error: "Checkout session is not a subscription." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return new Response(JSON.stringify({ error: "Checkout session is not paid." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownerId = session.client_reference_id || (await resolveOwnerId());
    let stripeInvoiceUrl: string | null = null;
    if (typeof session.invoice === "string") {
      try {
        const invoice = await stripe.invoices.retrieve(session.invoice);
        stripeInvoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null;
      } catch (invoiceError) {
        console.error("[Mintomics] Failed to retrieve Stripe invoice:", invoiceError);
      }
    }

    await upsertBillingState({
      ownerId,
      plan: "pro",
      cycle: toBillingCycle(session.metadata?.cycle),
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
      stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
      stripeSessionId: session.id,
      stripeInvoiceId: typeof session.invoice === "string" ? session.invoice : null,
      stripeInvoiceUrl,
      stripeStatus: session.payment_status ?? session.status ?? null,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        plan: "pro",
        billingPlan: "pro",
        cycle: toBillingCycle(session.metadata?.cycle),
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Mintomics] Failed to confirm Stripe checkout:", error);
    return new Response(JSON.stringify({ error: "Failed to confirm checkout." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
