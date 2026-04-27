import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, FileText, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";
import { requireCurrentAuth } from "@/lib/auth/session";
import { getBillingState, isPostgresConfigured } from "@/lib/db/billing";
import { listProjects } from "@/lib/db/projects";
import { listOAuthAccountsForUser, listSessionsForUser } from "@/lib/auth/store";
import SignOutButton from "@/components/auth/SignOutButton";
import SignOutAllButton from "@/components/auth/SignOutAllButton";

export const runtime = "nodejs";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  },
};

export default async function AccountPage() {
  const auth = await requireCurrentAuth("/account");

  if (!auth?.user) {
    redirect("/sign-in?redirect_url=%2Faccount");
  }

  const user = auth.user;
  const billing = isPostgresConfigured() ? await getBillingState(user.id) : null;
  const projects = isPostgresConfigured() ? await listProjects(user.id) : [];
  const sessions = isPostgresConfigured() ? await listSessionsForUser(user.id, auth.session.id) : [];
  const oauthAccounts = isPostgresConfigured() ? await listOAuthAccountsForUser(user.id) : [];
  const primaryEmail = user.email ?? "Unavailable";
  const displayName = user.displayName || "Your account";
  const hasStripeCustomer = Boolean(billing?.stripeCustomerId);
  const billingHref = hasStripeCustomer ? "/api/billing/portal" : "/pricing";
  const billingLabel = hasStripeCustomer ? "Manage billing" : "Upgrade";
  const latestInvoiceHref = billing?.stripeInvoiceUrl ?? null;
  const planLabel = billing?.plan === "pro" ? "Pro" : "Free";
  const cycleLabel = billing?.cycle ?? "monthly";

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-gray-100 sm:px-6 sm:py-16">
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-6xl">
            Profile, billing, sessions, and history in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
            This is the operational surface for your Mintomics workspace. It shows your identity, billing status,
            active sessions, and the actions needed to manage the account cleanly.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                    Manage profile and sessions.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
                    Sessions are persisted as secure httpOnly cookies. You can review your active devices and sign out from here.
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    href={billingHref}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                  >
                    {billingLabel}
                  </Link>
                  <Link
                    href="/api/auth/google/link/start"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                  >
                    {oauthAccounts.some((account) => account.provider === "google")
                      ? "Google connected"
                      : "Link Google account"}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                  >
                    Compare plans
                  </Link>
                  <SignOutButton />
                  <SignOutAllButton />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
                <p className="text-sm font-semibold text-white">Active sessions</p>
                <div className="mt-4 space-y-3">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {session.current ? "Current session" : "Session"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-500">
                              {session.userAgent ?? "Unknown browser"}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            Expires {new Date(session.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No session data available yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                <div className="grid gap-4 p-5 sm:grid-cols-2">
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
                        Available after the next successful charge.
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
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-semibold text-white">Connected accounts</p>
                <div className="mt-3 space-y-3">
                  {oauthAccounts.length > 0 ? (
                    oauthAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {account.provider}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {account.providerEmail ?? "No email reported"}
                          </p>
                        </div>
                        <span className="text-xs uppercase tracking-[0.22em] text-gray-500">
                          Linked
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No external accounts linked yet.</p>
                  )}
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Support
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                Need help with billing or a custom setup?
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                Use the billing portal for payment methods, cancellations, and invoices.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Link
                  href="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                >
                  Pricing
                </Link>
                <Link
                  href="mailto:hello@Mintomics.ai?subject=Mintomics%20support"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
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
