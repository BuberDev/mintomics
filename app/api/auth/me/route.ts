import { getCurrentAuth } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const auth = await getCurrentAuth();

  return new Response(
    JSON.stringify({
      user: auth?.user ?? null,
      session: auth?.session ?? null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
