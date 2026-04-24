import { getPostgresSql, isPostgresConfigured } from "@/lib/db/postgres";

export { isPostgresConfigured } from "@/lib/db/postgres";

type SalesLeadRow = {
  id: string;
  owner_id: string | null;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  message: string;
  source: string;
  status: string;
  created_at: Date;
  updated_at: Date;
};

let setupPromise: Promise<void> | null = null;

async function ensureSalesLeadsTable() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    const db = await getPostgresSql();

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_sales_leads (
        id TEXT PRIMARY KEY,
        owner_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        role TEXT,
        message TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'agency_page',
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await db.sql`
      CREATE INDEX IF NOT EXISTS Mintomics_sales_leads_created_idx
      ON Mintomics_sales_leads (created_at DESC)
    `;
  })();

  return setupPromise;
}

function createLeadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createSalesLead({
  ownerId,
  name,
  email,
  company,
  role,
  message,
  source = "agency_page",
}: {
  ownerId?: string | null;
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  message: string;
  source?: string;
}) {
  await ensureSalesLeadsTable();
  const db = await getPostgresSql();

  const { rows } = await db.sql<SalesLeadRow>`
    INSERT INTO Mintomics_sales_leads (
      id,
      owner_id,
      name,
      email,
      company,
      role,
      message,
      source,
      status,
      updated_at
    )
    VALUES (
      ${createLeadId()},
      ${ownerId ?? null},
      ${name},
      ${email},
      ${company ?? null},
      ${role ?? null},
      ${message},
      ${source},
      'new',
      NOW()
    )
    RETURNING id, owner_id, name, email, company, role, message, source, status, created_at, updated_at
  `;

  return rows[0];
}
