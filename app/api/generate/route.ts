import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { TOKENOMICS_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts";
import { normalizeTokenomicsOutput } from "@/lib/ai/normalize";
import { TokenomicsInputSchema, TokenomicsOutputSchema } from "@/lib/ai/schema";
import type { TokenomicsInput } from "@/types/mintomics";
import { getCurrentUserId } from "@/lib/auth/session";

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

const FALLBACK_MODELS = [
  "deepseek/deepseek-chat-v3.1",
  "deepseek/deepseek-chat",
  "deepseek/deepseek-r1-0528",
  "deepseek/deepseek-r1",
] as const;

function hasRealOpenRouterKey(value: string | undefined) {
  if (!value) return false;
  return !value.includes("...");
}

function getCandidateModels(primaryModel: string | undefined) {
  const candidates = [primaryModel, ...FALLBACK_MODELS].filter(
    (model): model is string => Boolean(model && model.trim().length > 0),
  );

  return Array.from(new Set(candidates));
}

function getStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) {
    return undefined;
  }

  return Number((error as { statusCode: unknown }).statusCode);
}

function shouldTryNextModel(error: unknown) {
  const statusCode = getStatusCode(error);
  const message = error instanceof Error ? error.message : "";

  if (statusCode === 401 || statusCode === 403) {
    return false;
  }

  return (
    statusCode === 404 ||
    statusCode === 429 ||
    (typeof statusCode === "number" && statusCode >= 500) ||
    message.includes("No endpoints found") ||
    message.includes("temporarily unavailable")
  );
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
    const userId = await getCurrentUserId();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

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
    const candidateModels = getCandidateModels(process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3.1");

    let result: Awaited<ReturnType<typeof generateText>> | null = null;
    let lastError: unknown = null;

    for (const modelId of candidateModels) {
      try {
        result = await generateText({
          model: openrouter(modelId),
          system: TOKENOMICS_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
          temperature: 0.2,
          maxTokens: 9000,
        });
        break;
      } catch (error) {
        lastError = error;
        const statusCode = getStatusCode(error);
        console.warn(`[Mintomics] Model attempt failed for ${modelId}${statusCode ? ` (status ${statusCode})` : ""}:`, error);

        if (!shouldTryNextModel(error) || modelId === candidateModels[candidateModels.length - 1]) {
          break;
        }
      }
    }

    if (!result) {
      console.warn("[Mintomics] Falling back to deterministic output after all model attempts failed:", lastError);
      const normalizedOutput = normalizeTokenomicsOutput(input, null);

      return new Response(JSON.stringify(normalizedOutput), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    const statusCode = getStatusCode(error);

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
