import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/types";
import { getPostgresSql, isPostgresConfigured } from "@/lib/db/postgres";

export { isPostgresConfigured } from "@/lib/db/postgres";

type EventRow = {
  id: string;
  owner_id: string;
  event_name: AnalyticsEventName;
  payload_json: AnalyticsPayload;
  path: string | null;
  href: string | null;
  referrer: string | null;
  created_at: Date;
};

let setupPromise: Promise<void> | null = null;

async function ensureEventsTable() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    const db = await getPostgresSql();

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_events (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        path TEXT,
        href TEXT,
        referrer TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await db.sql`
      CREATE INDEX IF NOT EXISTS Mintomics_events_owner_created_idx
      ON Mintomics_events (owner_id, created_at DESC)
    `;
  })();

  return setupPromise;
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function recordAnalyticsEvent({
  ownerId,
  name,
  payload,
  path,
  href,
  referrer,
}: {
  ownerId: string;
  name: AnalyticsEventName;
  payload: AnalyticsPayload;
  path?: string | null;
  href?: string | null;
  referrer?: string | null;
}) {
  await ensureEventsTable();
  const db = await getPostgresSql();

  const { rows } = await db.sql<EventRow>`
    INSERT INTO Mintomics_events (
      id,
      owner_id,
      event_name,
      payload_json,
      path,
      href,
      referrer
    )
    VALUES (
      ${createEventId()},
      ${ownerId},
      ${name},
      ${JSON.stringify(payload)}::jsonb,
      ${path ?? null},
      ${href ?? null},
      ${referrer ?? null}
    )
    RETURNING id, owner_id, event_name, payload_json, path, href, referrer, created_at
  `;

  return rows[0];
}
