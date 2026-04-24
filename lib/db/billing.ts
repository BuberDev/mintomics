import { getPostgresSql, isPostgresConfigured } from "@/lib/db/postgres";

export { isPostgresConfigured } from "@/lib/db/postgres";

type BillingCycle = "monthly" | "annual";
type BillingPlan = "free" | "pro";

type BillingRow = {
  owner_id: string;
  plan: BillingPlan;
  cycle: BillingCycle | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_session_id: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  stripe_status: string | null;
  created_at: Date;
  updated_at: Date;
};

let setupPromise: Promise<void> | null = null;

async function ensureBillingTable() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    const db = await getPostgresSql();

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_billing (
        owner_id TEXT PRIMARY KEY,
        plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
        cycle TEXT CHECK (cycle IN ('monthly', 'annual')),
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_session_id TEXT,
        stripe_invoice_id TEXT,
        stripe_invoice_url TEXT,
        stripe_status TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await db.sql`
      ALTER TABLE Mintomics_billing
      ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT
    `;
    await db.sql`
      ALTER TABLE Mintomics_billing
      ADD COLUMN IF NOT EXISTS stripe_invoice_url TEXT
    `;
  })();

  return setupPromise;
}

function toBillingState(row: BillingRow | null) {
  return {
    ownerId: row?.owner_id ?? null,
    plan: row?.plan ?? "free",
    cycle: row?.cycle ?? null,
    stripeCustomerId: row?.stripe_customer_id ?? null,
    stripeSubscriptionId: row?.stripe_subscription_id ?? null,
    stripeSessionId: row?.stripe_session_id ?? null,
    stripeInvoiceId: row?.stripe_invoice_id ?? null,
    stripeInvoiceUrl: row?.stripe_invoice_url ?? null,
    stripeStatus: row?.stripe_status ?? null,
    createdAt: row ? new Date(row.created_at).toISOString() : null,
    updatedAt: row ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function getBillingState(ownerId: string) {
  await ensureBillingTable();
  const db = await getPostgresSql();

  const { rows } = await db.sql<BillingRow>`
    SELECT owner_id, plan, cycle, stripe_customer_id, stripe_subscription_id, stripe_session_id, stripe_invoice_id, stripe_invoice_url, stripe_status, created_at, updated_at
    FROM Mintomics_billing
    WHERE owner_id = ${ownerId}
    LIMIT 1
  `;

  return toBillingState(rows[0] ?? null);
}

export async function upsertBillingState({
  ownerId,
  plan,
  cycle,
  stripeCustomerId,
  stripeSubscriptionId,
  stripeSessionId,
  stripeInvoiceId,
  stripeInvoiceUrl,
  stripeStatus,
}: {
  ownerId: string;
  plan: BillingPlan;
  cycle?: BillingCycle | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeSessionId?: string | null;
  stripeInvoiceId?: string | null;
  stripeInvoiceUrl?: string | null;
  stripeStatus?: string | null;
}) {
  await ensureBillingTable();
  const db = await getPostgresSql();

  const { rows } = await db.sql<BillingRow>`
    INSERT INTO Mintomics_billing (
      owner_id,
      plan,
      cycle,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_session_id,
      stripe_invoice_id,
      stripe_invoice_url,
      stripe_status,
      updated_at
    )
    VALUES (
      ${ownerId},
      ${plan},
      ${cycle ?? null},
      ${stripeCustomerId ?? null},
      ${stripeSubscriptionId ?? null},
      ${stripeSessionId ?? null},
      ${stripeInvoiceId ?? null},
      ${stripeInvoiceUrl ?? null},
      ${stripeStatus ?? null},
      NOW()
    )
    ON CONFLICT (owner_id)
    DO UPDATE SET
      plan = EXCLUDED.plan,
      cycle = COALESCE(EXCLUDED.cycle, Mintomics_billing.cycle),
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, Mintomics_billing.stripe_customer_id),
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, Mintomics_billing.stripe_subscription_id),
      stripe_session_id = COALESCE(EXCLUDED.stripe_session_id, Mintomics_billing.stripe_session_id),
      stripe_invoice_id = COALESCE(EXCLUDED.stripe_invoice_id, Mintomics_billing.stripe_invoice_id),
      stripe_invoice_url = COALESCE(EXCLUDED.stripe_invoice_url, Mintomics_billing.stripe_invoice_url),
      stripe_status = COALESCE(EXCLUDED.stripe_status, Mintomics_billing.stripe_status),
      updated_at = NOW()
    RETURNING owner_id, plan, cycle, stripe_customer_id, stripe_subscription_id, stripe_session_id, stripe_invoice_id, stripe_invoice_url, stripe_status, created_at, updated_at
  `;

  return toBillingState(rows[0] ?? null);
}
