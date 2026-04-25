import { getPostgresSql, isPostgresConfigured } from "@/lib/db/postgres";
import { generateId } from "@/lib/auth/crypto";

type RateLimitRow = {
  key: string;
  window_started_at: Date;
  count: number;
  blocked_until: Date | null;
  created_at: Date;
  updated_at: Date;
};

let setupPromise: Promise<void> | null = null;

async function ensureRateLimitTable() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    const db = await getPostgresSql();

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_rate_limits (
        key TEXT PRIMARY KEY,
        window_started_at TIMESTAMPTZ NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        blocked_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await db.sql`
      CREATE INDEX IF NOT EXISTS Mintomics_rate_limits_blocked_idx
      ON Mintomics_rate_limits (blocked_until)
    `;
  })();

  return setupPromise;
}

export async function assertRateLimit({
  key,
  limit,
  windowMs,
  blockMs = windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
  blockMs?: number;
}) {
  if (!isPostgresConfigured()) {
    return;
  }

  await ensureRateLimitTable();
  const db = await getPostgresSql();
  const now = new Date();

  const { rows } = await db.sql<RateLimitRow>`
    INSERT INTO Mintomics_rate_limits (key, window_started_at, count, blocked_until, created_at, updated_at)
    VALUES (${key}, ${now}, 1, NULL, NOW(), NOW())
    ON CONFLICT (key)
    DO UPDATE SET
      count = CASE
        WHEN Mintomics_rate_limits.blocked_until IS NOT NULL AND Mintomics_rate_limits.blocked_until > NOW()
          THEN Mintomics_rate_limits.count
        WHEN Mintomics_rate_limits.window_started_at < NOW() - (${windowMs} * INTERVAL '1 millisecond')
          THEN 1
        ELSE Mintomics_rate_limits.count + 1
      END,
      window_started_at = CASE
        WHEN Mintomics_rate_limits.blocked_until IS NOT NULL AND Mintomics_rate_limits.blocked_until > NOW()
          THEN Mintomics_rate_limits.window_started_at
        WHEN Mintomics_rate_limits.window_started_at < NOW() - (${windowMs} * INTERVAL '1 millisecond')
          THEN NOW()
        ELSE Mintomics_rate_limits.window_started_at
      END,
      blocked_until = CASE
        WHEN Mintomics_rate_limits.blocked_until IS NOT NULL AND Mintomics_rate_limits.blocked_until > NOW()
          THEN Mintomics_rate_limits.blocked_until
        WHEN Mintomics_rate_limits.window_started_at < NOW() - (${windowMs} * INTERVAL '1 millisecond')
          THEN NULL
        WHEN Mintomics_rate_limits.count + 1 > ${limit}
          THEN NOW() + (${blockMs} * INTERVAL '1 millisecond')
        ELSE NULL
      END,
      updated_at = NOW()
    RETURNING key, window_started_at, count, blocked_until, created_at, updated_at
  `;

  const row = rows[0];

  if (!row) {
    return;
  }

  if (row.blocked_until && row.blocked_until > now) {
    const retryAfterSeconds = Math.max(1, Math.ceil((row.blocked_until.getTime() - now.getTime()) / 1000));
    const error = new Error("Too many attempts. Please try again later.");
    (error as Error & { statusCode?: number; retryAfterSeconds?: number }).statusCode = 429;
    (error as Error & { statusCode?: number; retryAfterSeconds?: number }).retryAfterSeconds = retryAfterSeconds;
    throw error;
  }

  if (row.count > limit) {
    const error = new Error("Too many attempts. Please try again later.");
    (error as Error & { statusCode?: number; retryAfterSeconds?: number }).statusCode = 429;
    (error as Error & { statusCode?: number; retryAfterSeconds?: number }).retryAfterSeconds = Math.max(1, Math.ceil(blockMs / 1000));
    throw error;
  }
}

export function buildRateLimitKey(scope: string, value: string) {
  return `${scope}:${value}`;
}

export function buildRequestFingerprint(ip: string | null, userAgent: string | null) {
  return [
    ip ?? "unknown-ip",
    userAgent?.slice(0, 80) ?? "unknown-ua",
  ].join("|");
}
