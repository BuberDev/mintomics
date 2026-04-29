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

    // Send Lead Notification to Founder
    try {
      const { sendAuthEmail } = await import("@/lib/auth/mailer");
      const founderEmail = process.env.FOUNDER_EMAIL || "hello@mintomics.com";
      await sendAuthEmail({
        to: founderEmail,
        subject: `New Agency Lead: ${name} (${body.company || "No Company"})`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h1 style="font-size:20px;margin:0 0 16px">New Agency Request</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${body.company || "N/A"}</p>
            <p><strong>Role:</strong> ${body.role || "N/A"}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px">${message}</p>
            <hr style="margin:24px 0;border:0;border-top:1px solid #e5e7eb" />
            <p style="font-size:12px;color:#6b7280">This lead was recorded in the database and tracked via the Agency landing page.</p>
          </div>
        `,
        text: `New Agency Lead\n\nName: ${name}\nEmail: ${email}\nCompany: ${body.company || "N/A"}\nRole: ${body.role || "N/A"}\n\nMessage:\n${message}`,
      });
    } catch (emailError) {
      console.error("[Mintomics] Failed to send lead notification email:", emailError);
    }

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
