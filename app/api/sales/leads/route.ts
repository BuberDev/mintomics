import { NextRequest } from "next/server";
import { resolveOwnerId } from "@/lib/auth/owner";
import { createSalesLead, isPostgresConfigured } from "@/lib/db/sales";

export const runtime = "nodejs";

function serviceUnavailable() {
  return new Response(
    JSON.stringify({
      error: "Postgres is not configured. Set POSTGRES_URL (and related vars) in .env.local.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  if (!isPostgresConfigured()) {
    return serviceUnavailable();
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      company?: string;
      role?: string;
      message?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Name, email, and message are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownerId = await resolveOwnerId();
    const lead = await createSalesLead({
      ownerId,
      name,
      email,
      company: body.company?.trim() || null,
      role: body.role?.trim() || null,
      message,
      source: "agency_page",
    });

    return new Response(JSON.stringify({ lead }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Failed to create sales lead:", error);
    return new Response(JSON.stringify({ error: "Failed to submit your request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
