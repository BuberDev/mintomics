import { getPostgresSql, isPostgresConfigured } from "@/lib/db/postgres";
import { generateId } from "@/lib/auth/crypto";
import { sha256Base64url } from "@/lib/auth/crypto";

type UserRow = {
  id: string;
  email: string;
  email_normalized: string;
  display_name: string;
  avatar_url: string | null;
  email_verified_at: Date | null;
  disabled_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type PasswordCredentialRow = {
  user_id: string;
  password_hash: string;
  password_updated_at: Date;
};

type OAuthAccountRow = {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  provider_email: string | null;
  provider_email_normalized: string | null;
  created_at: Date;
  updated_at: Date;
};

type SessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date;
  last_seen_at: Date;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionWithUser = {
  session: {
    id: string;
    expiresAt: string;
    createdAt: string;
    lastSeenAt: string;
  };
  user: AuthUser;
};

let setupPromise: Promise<void> | null = null;

async function ensureAuthTables() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    const db = await getPostgresSql();

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        email_normalized TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        email_verified_at TIMESTAMPTZ,
        disabled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_password_credentials (
        user_id TEXT PRIMARY KEY REFERENCES Mintomics_users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        password_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_oauth_accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES Mintomics_users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        provider_email TEXT,
        provider_email_normalized TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (provider, provider_account_id),
        UNIQUE (user_id, provider)
      )
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS Mintomics_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES Mintomics_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        user_agent TEXT,
        ip_address TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await db.sql`
      CREATE INDEX IF NOT EXISTS Mintomics_sessions_user_expires_idx
      ON Mintomics_sessions (user_id, expires_at DESC)
    `;
  })();

  return setupPromise;
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    emailVerifiedAt: row.email_verified_at ? row.email_verified_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function createDefaultDisplayName(email: string) {
  const localPart = email.split("@")[0] || "Mintomics user";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export async function findUserByEmail(email: string) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();
  const normalizedEmail = email.toLowerCase();

  const { rows } = await db.sql<UserRow>`
    SELECT id, email, email_normalized, display_name, avatar_url, email_verified_at, disabled_at, created_at, updated_at
    FROM Mintomics_users
    WHERE email_normalized = ${normalizedEmail}
    LIMIT 1
  `;

  return rows[0] ? toAuthUser(rows[0]) : null;
}

export async function findUserById(userId: string) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();

  const { rows } = await db.sql<UserRow>`
    SELECT id, email, email_normalized, display_name, avatar_url, email_verified_at, disabled_at, created_at, updated_at
    FROM Mintomics_users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0] ? toAuthUser(rows[0]) : null;
}

export async function findUserByProviderAccount(provider: string, providerAccountId: string) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();

  const { rows } = await db.sql<UserRow & OAuthAccountRow>`
    SELECT u.id, u.email, u.email_normalized, u.display_name, u.avatar_url, u.email_verified_at, u.disabled_at, u.created_at, u.updated_at,
           a.id as oauth_id, a.user_id, a.provider, a.provider_account_id, a.provider_email, a.provider_email_normalized, a.created_at as oauth_created_at, a.updated_at as oauth_updated_at
    FROM Mintomics_oauth_accounts a
    JOIN Mintomics_users u ON u.id = a.user_id
    WHERE a.provider = ${provider} AND a.provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  return rows[0] ? toAuthUser(rows[0]) : null;
}

export async function listOAuthAccountsForUser(userId: string) {
  if (!isPostgresConfigured()) {
    return [];
  }

  await ensureAuthTables();
  const db = await getPostgresSql();

  const { rows } = await db.sql<OAuthAccountRow>`
    SELECT id, user_id, provider, provider_account_id, provider_email, provider_email_normalized, created_at, updated_at
    FROM Mintomics_oauth_accounts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    provider: row.provider,
    providerAccountId: row.provider_account_id,
    providerEmail: row.provider_email,
    providerEmailNormalized: row.provider_email_normalized,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));
}

export async function createPasswordUser({
  email,
  passwordHash,
  displayName,
}: {
  email: string;
  passwordHash: string;
  displayName?: string | null;
}) {
  await ensureAuthTables();
  const db = await getPostgresSql();
  const normalizedEmail = email.toLowerCase();
  const userId = generateId("user");
  const resolvedDisplayName = displayName?.trim() || createDefaultDisplayName(email);

  const { rows } = await db.sql<UserRow>`
    INSERT INTO Mintomics_users (
      id,
      email,
      email_normalized,
      display_name,
      created_at,
      updated_at
    )
    VALUES (
      ${userId},
      ${email},
      ${normalizedEmail},
      ${resolvedDisplayName},
      NOW(),
      NOW()
    )
    RETURNING id, email, email_normalized, display_name, avatar_url, email_verified_at, disabled_at, created_at, updated_at
  `;

  await db.sql`
    INSERT INTO Mintomics_password_credentials (user_id, password_hash, password_updated_at)
    VALUES (${userId}, ${passwordHash}, NOW())
  `;

  return toAuthUser(rows[0]);
}

export async function setUserEmailVerified(userId: string, verifiedAt = new Date()) {
  await ensureAuthTables();
  const db = await getPostgresSql();

  const { rows } = await db.sql<UserRow>`
    UPDATE Mintomics_users
    SET email_verified_at = COALESCE(email_verified_at, ${verifiedAt}),
        updated_at = NOW()
    WHERE id = ${userId}
    RETURNING id, email, email_normalized, display_name, avatar_url, email_verified_at, disabled_at, created_at, updated_at
  `;

  return rows[0] ? toAuthUser(rows[0]) : null;
}

export async function upsertUserPasswordHash(userId: string, passwordHash: string) {
  await ensureAuthTables();
  const db = await getPostgresSql();

  await db.sql`
    INSERT INTO Mintomics_password_credentials (user_id, password_hash, password_updated_at)
    VALUES (${userId}, ${passwordHash}, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      password_updated_at = NOW()
  `;
}

export async function createOAuthUser({
  provider,
  providerAccountId,
  email,
  displayName,
  avatarUrl,
  providerEmail,
}: {
  provider: string;
  providerAccountId: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  providerEmail?: string | null;
}) {
  await ensureAuthTables();
  const db = await getPostgresSql();
  const normalizedEmail = email.toLowerCase();
  const userId = generateId("user");
  const resolvedDisplayName = displayName?.trim() || createDefaultDisplayName(email);
  const oauthId = generateId("oauth");

  const { rows } = await db.sql<UserRow>`
    INSERT INTO Mintomics_users (
      id,
      email,
      email_normalized,
      display_name,
      avatar_url,
      email_verified_at,
      created_at,
      updated_at
    )
    VALUES (
      ${userId},
      ${email},
      ${normalizedEmail},
      ${resolvedDisplayName},
      ${avatarUrl ?? null},
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (email_normalized)
    DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, Mintomics_users.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, Mintomics_users.avatar_url),
      email_verified_at = COALESCE(Mintomics_users.email_verified_at, NOW()),
      updated_at = NOW()
    RETURNING id, email, email_normalized, display_name, avatar_url, email_verified_at, disabled_at, created_at, updated_at
  `;

  const user = toAuthUser(rows[0]);

  await db.sql`
    INSERT INTO Mintomics_oauth_accounts (
      id,
      user_id,
      provider,
      provider_account_id,
      provider_email,
      provider_email_normalized,
      created_at,
      updated_at
    )
    VALUES (
      ${oauthId},
      ${user.id},
      ${provider},
      ${providerAccountId},
      ${providerEmail ?? email},
      ${normalizeProviderEmail(providerEmail ?? email)},
      NOW(),
      NOW()
    )
    ON CONFLICT (provider, provider_account_id)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      provider_email = EXCLUDED.provider_email,
      provider_email_normalized = EXCLUDED.provider_email_normalized,
      updated_at = NOW()
  `;

  return user;
}

export async function attachOAuthAccountToUser({
  userId,
  provider,
  providerAccountId,
  providerEmail,
  avatarUrl,
}: {
  userId: string;
  provider: string;
  providerAccountId: string;
  providerEmail?: string | null;
  avatarUrl?: string | null;
}) {
  await ensureAuthTables();
  const db = await getPostgresSql();

  await db.sql`
    UPDATE Mintomics_users
    SET avatar_url = COALESCE(${avatarUrl ?? null}, avatar_url),
        email_verified_at = COALESCE(email_verified_at, NOW()),
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  await db.sql`
    INSERT INTO Mintomics_oauth_accounts (
      id,
      user_id,
      provider,
      provider_account_id,
      provider_email,
      provider_email_normalized,
      created_at,
      updated_at
    )
    VALUES (
      ${generateId("oauth")},
      ${userId},
      ${provider},
      ${providerAccountId},
      ${providerEmail ?? null},
      ${normalizeProviderEmail(providerEmail ?? undefined)},
      NOW(),
      NOW()
    )
    ON CONFLICT (provider, provider_account_id)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      provider_email = EXCLUDED.provider_email,
      provider_email_normalized = EXCLUDED.provider_email_normalized,
      updated_at = NOW()
  `;
}

export async function getPasswordCredential(userId: string) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();

  const { rows } = await db.sql<PasswordCredentialRow>`
    SELECT user_id, password_hash, password_updated_at
    FROM Mintomics_password_credentials
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getUserBySessionToken(token: string) {
  if (!isPostgresConfigured()) {
    return null;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();
  const tokenHash = sha256Base64url(token);

  const { rows } = await db.sql<SessionRow & UserRow>`
    SELECT s.id, s.user_id, s.token_hash, s.user_agent, s.ip_address, s.expires_at, s.last_seen_at, s.revoked_at, s.created_at, s.updated_at,
           u.id as user_row_id, u.email, u.email_normalized, u.display_name, u.avatar_url, u.email_verified_at, u.disabled_at, u.created_at as user_created_at, u.updated_at as user_updated_at
    FROM Mintomics_sessions s
    JOIN Mintomics_users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
      AND u.disabled_at IS NULL
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    session: {
      id: row.id,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      lastSeenAt: row.last_seen_at.toISOString(),
    },
    user: toAuthUser({
      id: row.user_id,
      email: row.email,
      email_normalized: row.email_normalized,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      email_verified_at: row.email_verified_at,
      disabled_at: row.disabled_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  } satisfies SessionWithUser;
}

export async function createSessionRecord({
  userId,
  tokenHash,
  userAgent,
  ipAddress,
  expiresAt,
}: {
  userId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}) {
  await ensureAuthTables();
  const db = await getPostgresSql();

  const { rows } = await db.sql<SessionRow>`
    INSERT INTO Mintomics_sessions (
      id,
      user_id,
      token_hash,
      user_agent,
      ip_address,
      expires_at,
      last_seen_at,
      created_at,
      updated_at
    )
    VALUES (
      ${generateId("session")},
      ${userId},
      ${tokenHash},
      ${userAgent ?? null},
      ${ipAddress ?? null},
      ${expiresAt},
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING id, user_id, token_hash, user_agent, ip_address, expires_at, last_seen_at, revoked_at, created_at, updated_at
  `;

  return rows[0] ?? null;
}

export async function revokeSessionByTokenHash(tokenHash: string) {
  if (!isPostgresConfigured()) {
    return;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();

  await db.sql`
    UPDATE Mintomics_sessions
    SET revoked_at = NOW(), updated_at = NOW()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
  `;
}

export async function revokeAllSessionsForUser(userId: string) {
  if (!isPostgresConfigured()) {
    return;
  }

  await ensureAuthTables();
  const db = await getPostgresSql();

  await db.sql`
    UPDATE Mintomics_sessions
    SET revoked_at = NOW(), updated_at = NOW()
    WHERE user_id = ${userId} AND revoked_at IS NULL
  `;
}

export async function listSessionsForUser(userId: string, currentSessionId?: string | null) {
  if (!isPostgresConfigured()) {
    return [];
  }

  await ensureAuthTables();
  const db = await getPostgresSql();
  const { rows } = await db.sql<SessionRow>`
    SELECT id, user_id, token_hash, user_agent, ip_address, expires_at, last_seen_at, revoked_at, created_at, updated_at
    FROM Mintomics_sessions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    expiresAt: row.expires_at.toISOString(),
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
    lastSeenAt: row.last_seen_at.toISOString(),
    createdAt: row.created_at.toISOString(),
    revokedAt: row.revoked_at ? row.revoked_at.toISOString() : null,
    current: row.id === currentSessionId,
  }));
}

export async function findUserPasswordHash(userId: string) {
  const credential = await getPasswordCredential(userId);
  return credential?.password_hash ?? null;
}

function normalizeProviderEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}
