import { sql } from "@vercel/postgres";
import type {
  PlanTier,
  SavedTokenomicsProject,
  TokenomicsInput,
  TokenomicsOutput,
} from "@/types/mintomics";

function hasRealEnvValue(value: string | undefined) {
  if (!value) return false;
  return !value.includes("...");
}

export function isPostgresConfigured() {
  return hasRealEnvValue(process.env.POSTGRES_URL);
}

type ProjectRow = {
  id: string;
  owner_id: string;
  input_json: TokenomicsInput;
  result_json: TokenomicsOutput;
  plan: PlanTier;
  created_at: Date;
  updated_at: Date;
};

let setupPromise: Promise<void> | null = null;

async function ensureProjectsTable() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS tokenforge_projects (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        input_json JSONB NOT NULL,
        result_json JSONB NOT NULL,
        plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS tokenforge_projects_owner_updated_idx
      ON tokenforge_projects (owner_id, updated_at DESC)
    `;
  })();

  return setupPromise;
}

function toSavedProject(row: ProjectRow): SavedTokenomicsProject {
  return {
    id: row.id,
    ownerId: row.owner_id,
    input: row.input_json,
    result: row.result_json,
    plan: row.plan,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function createProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProjects(ownerId: string) {
  await ensureProjectsTable();

  const { rows } = await sql<ProjectRow>`
    SELECT id, owner_id, input_json, result_json, plan, created_at, updated_at
    FROM tokenforge_projects
    WHERE owner_id = ${ownerId}
    ORDER BY updated_at DESC
  `;

  return rows.map(toSavedProject);
}

export async function upsertProject({
  ownerId,
  projectId,
  input,
  result,
  plan,
}: {
  ownerId: string;
  projectId?: string | null;
  input: TokenomicsInput;
  result: TokenomicsOutput;
  plan: PlanTier;
}) {
  await ensureProjectsTable();

  const id = projectId || createProjectId();

  const { rows } = await sql<ProjectRow>`
    INSERT INTO tokenforge_projects (id, owner_id, input_json, result_json, plan, updated_at)
    VALUES (
      ${id},
      ${ownerId},
      ${JSON.stringify(input)}::jsonb,
      ${JSON.stringify(result)}::jsonb,
      ${plan},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      owner_id = EXCLUDED.owner_id,
      input_json = EXCLUDED.input_json,
      result_json = EXCLUDED.result_json,
      plan = EXCLUDED.plan,
      updated_at = NOW()
    RETURNING id, owner_id, input_json, result_json, plan, created_at, updated_at
  `;

  return toSavedProject(rows[0]);
}

export async function deleteProject(ownerId: string, projectId: string) {
  await ensureProjectsTable();

  await sql`
    DELETE FROM tokenforge_projects
    WHERE id = ${projectId} AND owner_id = ${ownerId}
  `;
}

export async function updateProjectPlanRecord({
  ownerId,
  projectId,
  plan,
}: {
  ownerId: string;
  projectId: string;
  plan: PlanTier;
}) {
  await ensureProjectsTable();

  const { rows } = await sql<ProjectRow>`
    UPDATE tokenforge_projects
    SET plan = ${plan}, updated_at = NOW()
    WHERE id = ${projectId} AND owner_id = ${ownerId}
    RETURNING id, owner_id, input_json, result_json, plan, created_at, updated_at
  `;

  if (rows.length === 0) {
    return null;
  }

  return toSavedProject(rows[0]);
}
