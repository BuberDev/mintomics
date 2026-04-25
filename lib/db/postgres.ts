import { Pool, type QueryResultRow } from "pg";

type Primitive = string | number | boolean | null | undefined | Date;

type SqlClient = {
  sql: <O extends QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: Primitive[]
  ) => Promise<{ rows: O[] }>;
  end: () => Promise<void>;
};

let poolPromise: Promise<SqlClient> | null = null;

function hasRealEnvValue(value: string | undefined) {
  if (!value) return false;
  return !value.includes("...");
}

function getConnectionString() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (hasRealEnvValue(value)) {
      return value;
    }
  }

  return null;
}

function shouldUseSsl(connectionString: string) {
  return !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
}

function normalizeConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return connectionString;
  }
}

function createSqlClient(connectionString: string): SqlClient {
  const normalizedConnectionString = normalizeConnectionString(connectionString);
  const pool = new Pool({
    connectionString: normalizedConnectionString,
    ssl: shouldUseSsl(normalizedConnectionString)
      ? { rejectUnauthorized: false }
      : undefined,
    max: 1,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  });

  pool.on("error", (error) => {
    console.error("[Mintomics] Postgres pool error:", error);
  });

  return {
    async sql<O extends QueryResultRow>(strings: TemplateStringsArray, ...values: Primitive[]) {
      const text = strings.reduce((acc, chunk, index) => {
        const placeholder = index < values.length ? `$${index + 1}` : "";
        return `${acc}${chunk}${placeholder}`;
      }, "");

      const result = await pool.query<O>(text, values);
      return { rows: result.rows };
    },
    async end() {
      await pool.end();
    },
  };
}

export function isPostgresConfigured() {
  return Boolean(getConnectionString());
}

export async function getPostgresSql(): Promise<SqlClient> {
  if (poolPromise) {
    return poolPromise;
  }

  poolPromise = (async () => {
    const connectionString = getConnectionString();

    if (!connectionString) {
      throw new Error(
        "Postgres is not configured. Set DATABASE_URL or POSTGRES_URL in .env.local.",
      );
    }

    return createSqlClient(connectionString);
  })();

  return poolPromise;
}
