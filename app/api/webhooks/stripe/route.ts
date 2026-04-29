import { NextRequest } from "next/server";
import Stripe from "stripe";
import { findBillingOwnerIdByStripeCustomerId, upsertBillingState } from "@/lib/db/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing Stripe signature." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: "STRIPE_WEBHOOK_SECRET is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ownerId = session.client_reference_id;
        if (!ownerId) {
          console.warn("[Mintomics] Stripe checkout session missing client_reference_id.");
          break;
        }
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
          cycle: typeof session.metadata?.cycle === "string" ? (session.metadata.cycle === "annual" ? "annual" : "monthly") : null,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          stripeSessionId: session.id,
          stripeInvoiceId: typeof session.invoice === "string" ? session.invoice : null,
          stripeInvoiceUrl,
          stripeStatus: session.payment_status ?? session.status ?? null,
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const ownerId =
          typeof subscription.metadata?.ownerId === "string"
            ? subscription.metadata.ownerId
            : typeof subscription.customer === "string"
              ? await findBillingOwnerIdByStripeCustomerId(subscription.customer)
              : null;
        if (!ownerId) {
          console.warn("[Mintomics] Stripe subscription event could not resolve owner.");
          break;
        }
        await upsertBillingState({
          ownerId,
          plan: event.type === "customer.subscription.deleted" ? "free" : "pro",
          cycle: typeof subscription.metadata?.cycle === "string"
            ? (subscription.metadata.cycle === "annual" ? "annual" : "monthly")
            : null,
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
          stripeStatus: subscription.status,
        });
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const ownerId =
          typeof invoice.customer === "string"
            ? await findBillingOwnerIdByStripeCustomerId(invoice.customer)
            : null;
        if (!ownerId) {
          console.warn("[Mintomics] Stripe invoice event could not resolve owner.");
          break;
        }
        await upsertBillingState({
          ownerId,
          plan: "pro",
          stripeCustomerId: typeof invoice.customer === "string" ? invoice.customer : null,
          stripeInvoiceId: invoice.id,
          stripeInvoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
          stripeStatus: invoice.status ?? null,
        });
        break;
      }
      case "invoice.payment_failed": {
        break;
      }
      default:
        // Unsupported event type
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    console.error("[Mintomics] Failed to process Stripe webhook:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
