import { getPostgresSql, isPostgresConfigured } from "@/lib/db/postgres";
import { generateId, generateSecureToken, sha256Base64url } from "@/lib/auth/crypto";

type AuthTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  token_type: string;
  email: string;
  metadata_json: Record<string, unknown> | null;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

let setupPromise: Promise<void> | null = null;

async function ensureAuthTokensTable() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    const db = await getPostgresSql();

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_auth_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES Mintomics_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        token_type TEXT NOT NULL,
        email TEXT NOT NULL,
        metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await db.sql`
      CREATE INDEX IF NOT EXISTS Mintomics_auth_tokens_type_email_idx
      ON Mintomics_auth_tokens (token_type, email, expires_at DESC)
    `;
  })();

  return setupPromise;
}

export async function createAuthToken({
  userId,
  email,
  tokenType,
  metadata = {},
  ttlMs,
}: {
  userId?: string | null;
  email: string;
  tokenType: "email_verification" | "password_reset";
  metadata?: Record<string, unknown>;
  ttlMs: number;
}) {
  if (!isPostgresConfigured()) {
    throw new Error("Postgres is not configured.");
  }

  await ensureAuthTokensTable();
  const db = await getPostgresSql();
  const token = generateSecureToken(48);
  const tokenHash = sha256Base64url(token);
  const expiresAt = new Date(Date.now() + ttlMs);

  await db.sql`
    INSERT INTO Mintomics_auth_tokens (
      id,
      user_id,
      token_hash,
      token_type,
      email,
      metadata_json,
      expires_at,
      created_at,
      updated_at
    )
    VALUES (
      ${generateId("auth_token")},
      ${userId ?? null},
      ${tokenHash},
      ${tokenType},
      ${email},
      ${JSON.stringify(metadata)}::jsonb,
      ${expiresAt},
      NOW(),
      NOW()
    )
  `;

  return { token, tokenHash, expiresAt };
}

export async function consumeAuthToken({
  token,
  tokenType,
}: {
  token: string;
  tokenType: "email_verification" | "password_reset";
}) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTokensTable();
  const db = await getPostgresSql();
  const tokenHash = sha256Base64url(token);

  const { rows } = await db.sql<AuthTokenRow>`
    UPDATE Mintomics_auth_tokens
    SET consumed_at = NOW(), updated_at = NOW()
    WHERE token_hash = ${tokenHash}
      AND token_type = ${tokenType}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    RETURNING id, user_id, token_hash, token_type, email, metadata_json, expires_at, consumed_at, created_at, updated_at
  `;

  return rows[0] ?? null;
}

export async function getLatestAuthToken({
  email,
  tokenType,
}: {
  email: string;
  tokenType: "email_verification" | "password_reset";
}) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTokensTable();
  const db = await getPostgresSql();

  const { rows } = await db.sql<AuthTokenRow>`
    SELECT id, user_id, token_hash, token_type, email, metadata_json, expires_at, consumed_at, created_at, updated_at
    FROM Mintomics_auth_tokens
    WHERE email = ${email}
      AND token_type = ${tokenType}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function deleteAuthTokensForEmail({
  email,
  tokenType,
}: {
  email: string;
  tokenType: "email_verification" | "password_reset";
}) {
  if (!isPostgresConfigured()) {
    return;
  }

  await ensureAuthTokensTable();
  const db = await getPostgresSql();

  await db.sql`
    DELETE FROM Mintomics_auth_tokens
    WHERE email = ${email}
      AND token_type = ${tokenType}
  `;
}

export async function cleanupExpiredAuthTokens() {
  if (!isPostgresConfigured()) {
    return;
  }

  await ensureAuthTokensTable();
  const db = await getPostgresSql();

  await db.sql`
    DELETE FROM Mintomics_auth_tokens
    WHERE expires_at <= NOW()
       OR consumed_at IS NOT NULL
  `;
}
