import { NextRequest } from "next/server";
import { deleteProject, isPostgresConfigured, updateProjectPlanRecord } from "@/lib/db/projects";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlanTier } from "@/types/mintomics";

export const runtime = "nodejs";

function serviceUnavailable() {
  return new Response(
    JSON.stringify({
      error: "Postgres is not configured. Set POSTGRES_URL (and related vars) in .env.local.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  if (!isPostgresConfigured()) {
    return serviceUnavailable();
  }

  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    await deleteProject(ownerId, params.projectId);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[Mintomics] Failed to delete project:", error);
    return new Response(JSON.stringify({ error: "Failed to delete project." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  if (!isPostgresConfigured()) {
    return serviceUnavailable();
  }

  try {
    const body = (await req.json()) as { plan?: PlanTier };
    if (!body.plan) {
      return new Response(JSON.stringify({ error: "Missing plan value." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const project = await updateProjectPlanRecord({
      ownerId,
      projectId: params.projectId,
      plan: body.plan,
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ project }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Failed to update plan:", error);
    return new Response(JSON.stringify({ error: "Failed to update plan." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
