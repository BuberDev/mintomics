"use client";

import { useEffect, useState } from "react";
import AuthControls from "@/components/auth/AuthControls";
import TokenomicsForm from "@/components/forms/TokenomicsForm";
import ProjectHistorySidebar from "@/components/results/ProjectHistorySidebar";
import { createDefaultTokenomicsInput } from "@/lib/mintomics/defaultInput";
import {
  deleteProjectRecord,
  listSavedProjects,
  saveProjectRecord,
  updateProjectPlan,
} from "@/lib/mintomics/projectStorage";
import type {
  PlanTier,
  SavedTokenomicsProject,
  TokenomicsInput,
  TokenomicsOutput,
  GenerationStatus,
} from "@/types/mintomics";
import Link from "next/link";
import ResultsDashboard from "@/components/results/ResultsDashboard";
import BrandLogo from "@/components/ui/brand-logo";

function parsePossiblyWrappedJson<T>(text: string): T {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(withoutFence) as T;
  } catch { }

  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1)) as T;
  }

  return JSON.parse(withoutFence) as T;
}

export default function GeneratePage() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<TokenomicsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [plan, setPlan] = useState<PlanTier>("free");
  const [savedProjects, setSavedProjects] = useState<SavedTokenomicsProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [draftInput, setDraftInput] = useState<TokenomicsInput>(
    createDefaultTokenomicsInput(),
  );
  const [formResetKey, setFormResetKey] = useState(0);
  const isGenerating = status === "generating" || status === "streaming";

  useEffect(() => {
    void syncSavedProjects();
  }, []);

  const syncSavedProjects = async () => {
    try {
      const projects = await listSavedProjects();
      setSavedProjects(projects);
    } catch (err) {
      console.error("[TokenForge] Failed to sync projects:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load saved projects.";
      setError((current) => current ?? message);
    }
  };

  const startNewProject = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setStreamedText("");
    setPlan("free");
    setActiveProjectId(null);
    setDraftInput(createDefaultTokenomicsInput());
    setFormResetKey((value) => value + 1);
  };

  const openSavedProject = (project: SavedTokenomicsProject) => {
    setActiveProjectId(project.id);
    setDraftInput(project.input);
    setPlan(project.plan);
    setResult(project.result);
    setStatus("complete");
    setError(null);
    setStreamedText("");
    setFormResetKey((value) => value + 1);
  };

  const handleDeleteProject = async (projectId: string) => {
    const shouldDelete =
      typeof window === "undefined"
        ? true
        : window.confirm("Delete this saved mintomics project from your workspace history?");

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProjectRecord(projectId);
      await syncSavedProjects();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project.";
      setError(message);
      return;
    }

    if (projectId === activeProjectId) {
      startNewProject();
    }
  };

  const handleGenerate = async (input: TokenomicsInput) => {
    setStatus("generating");
    setError(null);
    setStreamedText("");
    setResult(null);
    setDraftInput(input);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const fallbackMessage = "Generation failed";
        const contentType = response.headers.get("content-type") ?? "";
        let errorMessage = fallbackMessage;

        if (contentType.includes("application/json")) {
          try {
            const body = (await response.json()) as { error?: string };
            if (body.error) errorMessage = body.error;
          } catch { }
        }

        throw new Error(errorMessage);
      }
      if (!response.body) throw new Error("No response body");

      setStatus("streaming");

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Vercel AI SDK data stream format — extract text chunks
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              fullText += text;
              setStreamedText(fullText);
            } catch { }
          }
        }
      }

      // Parse the complete JSON output
      const parsed: TokenomicsOutput = parsePossiblyWrappedJson<TokenomicsOutput>(fullText);
      const savedProject = await saveProjectRecord({
        input,
        plan,
        projectId: activeProjectId,
        result: parsed,
      });

      setActiveProjectId(savedProject.id);
      await syncSavedProjects();
      setResult(parsed);
      setStatus("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandLogo
              variant="icon"
              width={36}
              height={36}
              priority
              className="h-9 w-9"
            />
            <BrandLogo
              variant="wordmark"
              width={220}
              height={56}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${plan === "pro"
                ? "border border-white/25 bg-white/10 text-white"
                : "border border-white/15 bg-white/5 text-gray-300"
                }`}
            >
              {plan === "pro" ? "Pro Preview" : "Free Plan"}
            </span>
            {status === "streaming" && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Generating your mintomics model...
              </span>
            )}
            {status === "complete" && (
              <span className="text-green-400">✓ Generation complete</span>
            )}
            <AuthControls mode="app" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <ProjectHistorySidebar
            activeProjectId={activeProjectId}
            onCreateNew={startNewProject}
            onDeleteProject={handleDeleteProject}
            onOpenProject={openSavedProject}
            projects={savedProjects}
          />

          <div>
            {/* FORM — shown when idle or error */}
            {(status === "idle" || status === "error") && (
              <>
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Design your mintomics
                  </h1>
                  <p className="text-gray-400">
                    Fill in your project details and get a complete model in ~30 seconds.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <TokenomicsForm
                  initialValues={draftInput}
                  isLoading={isGenerating}
                  onSubmit={handleGenerate}
                  resetKey={formResetKey}
                />
              </>
            )}

            {/* LOADING STATE */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Analyzing your project...
                  </h2>
                  <p className="text-gray-400 text-sm max-w-md">
                    Mintomics is designing your allocation model, vesting schedules,
                    emission curve, and running red flag analysis.
                  </p>
                </div>
                {streamedText.length > 10 && (
                  <div className="text-xs text-gray-600 font-mono max-w-sm truncate">
                    {streamedText.slice(-80)}...
                  </div>
                )}
              </div>
            )}

            {status === "complete" && result && (
              <ResultsDashboard
                onEditInputs={() => {
                  setStatus("idle");
                  setResult(null);
                  setError(null);
                  setStreamedText("");
                  setFormResetKey((value) => value + 1);
                }}
                plan={plan}
                result={result}
                onUpgradePreview={() => {
                  setPlan("pro");
                  if (activeProjectId) {
                    void updateProjectPlan(activeProjectId, "pro")
                      .then(() => {
                        void syncSavedProjects();
                      })
                      .catch((err) => {
                        const message =
                          err instanceof Error
                            ? err.message
                            : "Failed to update project plan.";
                        setError(message);
                      });
                  }
                }}
                onReset={startNewProject}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
