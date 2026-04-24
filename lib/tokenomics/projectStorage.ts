import type {
  PlanTier,
  SavedTokenomicsProject,
  TokenomicsInput,
  TokenomicsOutput,
} from "@/types/mintomics";

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(fallbackMessage);
  }

  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || fallbackMessage);
  }

  return body;
}

export async function listSavedProjects() {
  const response = await fetch("/api/projects", {
    method: "GET",
    cache: "no-store",
  });

  const body = await parseJsonResponse<{ projects: SavedTokenomicsProject[] }>(
    response,
    "Failed to load saved projects.",
  );

  return body.projects;
}

export async function saveProjectRecord({
  input,
  plan,
  projectId,
  result,
}: {
  input: TokenomicsInput;
  plan: PlanTier;
  projectId?: string | null;
  result: TokenomicsOutput;
}) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input,
      plan,
      projectId,
      result,
    }),
  });

  const body = await parseJsonResponse<{ project: SavedTokenomicsProject }>(
    response,
    "Failed to save project.",
  );

  return body.project;
}

export async function deleteProjectRecord(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
  });

  if (response.status === 204) {
    return;
  }

  await parseJsonResponse<Record<string, never>>(
    response,
    "Failed to delete project.",
  );
}

export async function updateProjectPlan(projectId: string, plan: PlanTier) {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  if (response.status === 404) {
    return null;
  }

  const body = await parseJsonResponse<{ project: SavedTokenomicsProject }>(
    response,
    "Failed to update plan.",
  );

  return body.project;
}
