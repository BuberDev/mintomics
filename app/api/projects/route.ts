import { NextRequest } from "next/server";
import { listProjects, isPostgresConfigured, upsertProject } from "@/lib/db/projects";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlanTier, TokenomicsInput, TokenomicsOutput } from "@/types/mintomics";

export const runtime = "nodejs";

function serviceUnavailable() {
  return new Response(
    JSON.stringify({
      error: "Postgres is not configured. Set POSTGRES_URL (and related vars) in .env.local.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export async function GET() {
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
    const projects = await listProjects(ownerId);

    return new Response(JSON.stringify({ projects }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Failed to list projects:", error);
    return new Response(JSON.stringify({ error: "Failed to load projects." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  if (!isPostgresConfigured()) {
    return serviceUnavailable();
  }

  try {
    const body = (await req.json()) as {
      input?: TokenomicsInput;
      result?: TokenomicsOutput;
      plan?: PlanTier;
      projectId?: string | null;
    };

    if (!body.input || !body.result || !body.plan) {
      return new Response(JSON.stringify({ error: "Missing required project payload." }), {
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
    const project = await upsertProject({
      ownerId,
      projectId: body.projectId,
      input: body.input,
      result: body.result,
      plan: body.plan,
    });

    return new Response(JSON.stringify({ project }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Failed to save project:", error);
    return new Response(JSON.stringify({ error: "Failed to save project." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
