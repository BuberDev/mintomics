import { NextRequest } from "next/server";
import { resolveOwnerId } from "@/lib/auth/owner";
import { isPostgresConfigured, recordAnalyticsEvent } from "@/lib/db/events";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/types";

export const runtime = "nodejs";

function asEventName(value: unknown): AnalyticsEventName | null {
  const allowed: AnalyticsEventName[] = [
    "landing_viewed",
    "cta_clicked",
    "pricing_viewed",
    "signup_started",
    "signup_completed",
    "wizard_step_completed",
    "generation_started",
    "generation_completed",
    "generation_failed",
    "paywall_viewed",
    "upgrade_started",
    "upgrade_completed",
    "pdf_exported",
    "project_opened",
    "project_deleted",
  ];

  return typeof value === "string" && allowed.includes(value as AnalyticsEventName)
    ? (value as AnalyticsEventName)
    : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: unknown;
      payload?: AnalyticsPayload;
      path?: string | null;
      href?: string | null;
      referrer?: string | null;
    };

    const name = asEventName(body.name);
    if (!name) {
      return new Response(JSON.stringify({ error: "Invalid event name." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isPostgresConfigured()) {
      const ownerId = await resolveOwnerId();
      await recordAnalyticsEvent({
        ownerId,
        name,
        payload: body.payload ?? {},
        path: body.path ?? null,
        href: body.href ?? null,
        referrer: body.referrer ?? null,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Mintomics] Failed to record analytics event:", error);
    return new Response(JSON.stringify({ error: "Failed to record event." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
