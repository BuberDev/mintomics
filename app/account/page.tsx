import Link from "next/link";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CreditCard, FileText, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth/config";
import { isPostgresConfigured, getBillingState } from "@/lib/db/billing";
import { listProjects } from "@/lib/db/projects";

export const runtime = "nodejs";

export default async function AccountPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
            Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Account management is not configured yet.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
            Once Clerk keys are configured, this surface will show profile settings, subscription status, invoice history, and billing portal access.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              View pricing
            </Link>
            <Link
              href="/generate"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              Back to app
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const billing = isPostgresConfigured() ? await getBillingState(userId) : null;
  const projects = isPostgresConfigured() ? await listProjects(userId) : [];
  const primaryEmail = user?.emailAddresses[0]?.emailAddress ?? "Unavailable";
  const displayName = user?.fullName || user?.firstName || "Your account";
  const avatar = user?.imageUrl ?? null;
  const hasStripeCustomer = Boolean(billing?.stripeCustomerId);
  const billingHref = hasStripeCustomer ? "/api/billing/portal" : "/pricing";
  const billingLabel = hasStripeCustomer ? "Manage billing" : "Upgrade";
  const latestInvoiceHref = billing?.stripeInvoiceUrl ?? null;
  const planLabel = billing?.plan === "pro" ? "Pro" : "Free";
  const cycleLabel = billing?.cycle ?? "monthly";

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="mb-8">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
            Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Profile, billing, and invoice history in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
            This is the operational surface for your Mintomics workspace. The account area shows your identity, current plan, payment status, invoices, and the actions needed to manage the subscription cleanly.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <UserCircle2 className="h-5 w-5 text-white/80" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                    Profile
                  </p>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{displayName}</h2>
                <p className="mt-2 text-sm text-gray-400">{primaryEmail}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-white/80" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                    Subscription
                  </p>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{planLabel}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  {billing?.plan === "pro"
                    ? `Status: ${billing.stripeStatus ?? "active"}`
                    : "No active subscription"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-white/80" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                    Workspace
                  </p>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{projects.length}</h2>
                <p className="mt-2 text-sm text-gray-400">Saved projects in your workspace</p>
              </div>
            </div>

            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Account settings
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Manage profile settings with Clerk.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
                    Update your name, email, password, sessions, and security settings here. This is the same surface users expect from a serious SaaS account center, not a hidden admin panel.
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-gray-300">
                  <Link
                    href={billingHref}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                  >
                    {billingLabel}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                  >
                    Compare plans
                  </Link>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                <UserProfile 
                  routing="hash" 
                  appearance={{ 
                    elements: { 
                      footer: "hidden",
                      navbar: {
                        "& > div:last-child": {
                          display: "none"
                        }
                      }
                    } 
                  }} 
                />
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Billing snapshot
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-white/80" />
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                      Billing cycle
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-white">{cycleLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-white/80" />
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                      Latest invoice
                    </p>
                  </div>
                  {latestInvoiceHref ? (
                    <Link
                      href={latestInvoiceHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white/70"
                    >
                      Open invoice
                    </Link>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">
                      Available in the billing portal after the next successful charge.
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                    Stripe customer
                  </p>
                  <p className="mt-2 break-all text-sm text-white">
                    {billing?.stripeCustomerId ?? "Not created yet"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                    Subscription
                  </p>
                  <p className="mt-2 break-all text-sm text-white">
                    {billing?.stripeSubscriptionId ?? "Not created yet"}
                  </p>
                </div>
              </div>
            </section>

            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Support
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Need help with billing or a custom setup?
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                Use the billing portal for payment methods, cancellations, and invoices. If you need Agency onboarding or a custom workflow, we keep that in a structured sales process.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                >
                  Pricing
                </Link>
                <Link
                  href="mailto:hello@Mintomics.ai?subject=Mintomics%20support"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                >
                  Email support
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
