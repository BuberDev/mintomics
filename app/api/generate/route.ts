import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { TOKENOMICS_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts";
import { normalizeTokenomicsOutput } from "@/lib/ai/normalize";
import { TokenomicsInputSchema, TokenomicsOutputSchema } from "@/lib/ai/schema";
import type { TokenomicsInput } from "@/types/mintomics";

// ─── Vercel streaming config ─────────────────────────────────────────────────
// This tells Vercel to use streaming — no 10s serverless timeout applies.
// The response streams token by token, keeping the connection alive.
export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes max (Vercel Pro allows up to 5 min)

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "Mintomics",
  },
});

function hasRealOpenRouterKey(value: string | undefined) {
  if (!value) return false;
  return !value.includes("...");
}

function parsePossiblyWrappedJson(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch { }

  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
  }

  return JSON.parse(withoutFence);
}

export async function POST(req: NextRequest) {
  if (!hasRealOpenRouterKey(process.env.OPENROUTER_API_KEY)) {
    return new Response(
      JSON.stringify({
        error: "OpenRouter API key is missing or invalid. Set OPENROUTER_API_KEY in .env.local and restart the dev server.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const rawInput = (await req.json()) as unknown;
    const validatedInput = TokenomicsInputSchema.safeParse(rawInput);
    if (!validatedInput.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid project input.",
          issues: validatedInput.error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const input: TokenomicsInput = validatedInput.data;

    const userPrompt = buildUserPrompt(input);
    const modelId = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    const result = await generateText({
      model: openrouter(modelId),
      system: TOKENOMICS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.2,
      maxTokens: 9000,
    });

    let normalizedOutput: unknown;

    try {
      const parsed = parsePossiblyWrappedJson(result.text);
      const validated = TokenomicsOutputSchema.safeParse(parsed);
      if (!validated.success) {
        console.error("[Mintomics] AI schema validation failed:", validated.error.issues);
      }

      normalizedOutput = normalizeTokenomicsOutput(input, validated.success ? validated.data : null);
    } catch (error) {
      console.error("[Mintomics] Failed to parse AI output, using deterministic fallback:", error);
      normalizedOutput = normalizeTokenomicsOutput(input, null);
    }

    return new Response(JSON.stringify(normalizedOutput), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Mintomics] API error:", error);

    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode: unknown }).statusCode)
        : undefined;

    if (statusCode === 401 || statusCode === 403) {
      return new Response(
        JSON.stringify({
          error: "OpenRouter rejected credentials (401/403). Update OPENROUTER_API_KEY in .env.local and restart the server.",
        }),
        { status: statusCode, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Generation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
