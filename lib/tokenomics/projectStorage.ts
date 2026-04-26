import type {
  PlanTier,
  SavedTokenomicsProject,
  TokenomicsInput,
  TokenomicsOutput,
} from "@/types/mintomics";

const LOCAL_PROJECTS_STORAGE_KEY = "mintomics_saved_projects_v1";

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

function isBrowser() {
  return typeof window !== "undefined";
}

function createProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readLocalProjects() {
  if (!isBrowser()) {
    return [] as SavedTokenomicsProject[];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_PROJECTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SavedTokenomicsProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalProjects(projects: SavedTokenomicsProject[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(LOCAL_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

function upsertLocalProject(project: SavedTokenomicsProject) {
  const projects = readLocalProjects();
  const index = projects.findIndex((item) => item.id === project.id);

  if (index === -1) {
    projects.unshift(project);
  } else {
    projects[index] = project;
  }

  writeLocalProjects(projects);
  return project;
}

function deleteLocalProject(projectId: string) {
  const projects = readLocalProjects().filter((project) => project.id !== projectId);
  writeLocalProjects(projects);
}

function updateLocalProjectPlan(projectId: string, plan: PlanTier) {
  const projects = readLocalProjects();
  const index = projects.findIndex((project) => project.id === projectId);

  if (index === -1) {
    return null;
  }

  const nextProject = {
    ...projects[index],
    plan,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = nextProject;
  writeLocalProjects(projects);
  return nextProject;
}

export async function listSavedProjects() {
  try {
    const response = await fetch("/api/projects", {
      method: "GET",
      cache: "no-store",
    });

    if (response.status === 503) {
      return readLocalProjects();
    }

    const body = await parseJsonResponse<{ projects: SavedTokenomicsProject[] }>(
      response,
      "Failed to load saved projects.",
    );

    return body.projects;
  } catch (error) {
    if (isBrowser()) {
      return readLocalProjects();
    }

    throw error;
  }
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
  try {
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

    if (response.status === 503) {
      const localProject: SavedTokenomicsProject = {
        id: projectId ?? createProjectId(),
        ownerId: "local-guest",
        input,
        result,
        plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return upsertLocalProject(localProject);
    }

    const body = await parseJsonResponse<{ project: SavedTokenomicsProject }>(
      response,
      "Failed to save project.",
    );

    return body.project;
  } catch (error) {
    if (isBrowser()) {
      const localProject: SavedTokenomicsProject = {
        id: projectId ?? createProjectId(),
        ownerId: "local-guest",
        input,
        result,
        plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return upsertLocalProject(localProject);
    }

    throw error;
  }
}

export async function deleteProjectRecord(projectId: string) {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      return;
    }

    if (response.status === 503 && isBrowser()) {
      deleteLocalProject(projectId);
      return;
    }

    await parseJsonResponse<Record<string, never>>(
      response,
      "Failed to delete project.",
    );
  } catch (error) {
    if (isBrowser()) {
      deleteLocalProject(projectId);
      return;
    }

    throw error;
  }
}

export async function updateProjectPlan(projectId: string, plan: PlanTier) {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (response.status === 404) {
      return null;
    }

    if (response.status === 503 && isBrowser()) {
      return updateLocalProjectPlan(projectId, plan);
    }

    const body = await parseJsonResponse<{ project: SavedTokenomicsProject }>(
      response,
      "Failed to update plan.",
    );

    return body.project;
  } catch (error) {
    if (isBrowser()) {
      return updateLocalProjectPlan(projectId, plan);
    }

    throw error;
  }
}
