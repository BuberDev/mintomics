"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthControls from "@/components/auth/AuthControls";
import TokenomicsForm from "@/components/forms/TokenomicsForm";
import ProjectHistorySidebar from "@/components/results/ProjectHistorySidebar";
import ResultsDashboard from "@/components/results/ResultsDashboard";
import BrandLogo from "@/components/ui/brand-logo";
import { trackEvent } from "@/lib/analytics/client";
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

export default function GenerateClient() {
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const checkoutSessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<TokenomicsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPlan, setBillingPlan] = useState<PlanTier>(checkoutState === "success" ? "pro" : "free");
  const [plan, setPlan] = useState<PlanTier>(checkoutState === "success" ? "pro" : "free");
  const [billingSyncState, setBillingSyncState] = useState<"idle" | "verifying" | "synced">(
    checkoutState === "success" ? "verifying" : "idle",
  );
  const [savedProjects, setSavedProjects] = useState<SavedTokenomicsProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [draftInput, setDraftInput] = useState<TokenomicsInput>(
    createDefaultTokenomicsInput(),
  );
  const [lastSubmittedInput, setLastSubmittedInput] = useState<TokenomicsInput | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const isGenerating = status === "generating" || status === "streaming";
  const effectivePlan: PlanTier = billingPlan === "pro" ? "pro" : plan;

  useEffect(() => {
    void syncSavedProjects();
  }, []);

  useEffect(() => {
    void fetch("/api/billing/status")
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{ billing?: { plan?: PlanTier } }>;
      })
      .then((payload) => {
        const serverPlan = payload?.billing?.plan;
        if (serverPlan === "pro") {
          setBillingPlan("pro");
          setPlan("pro");
        }
      })
      .catch((err) => {
        console.error("[Mintomics] Failed to load billing status:", err);
      });
  }, []);

  useEffect(() => {
    if (checkoutState !== "success") {
      setBillingSyncState("synced");
      return;
    }

    if (!checkoutSessionId) {
      setBillingSyncState("synced");
      return;
    }

    setBillingSyncState("verifying");

    void fetch(`/api/billing/complete?session_id=${encodeURIComponent(checkoutSessionId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to confirm checkout.");
        }

        return response.json() as Promise<{ plan?: PlanTier; billingPlan?: "pro"; cycle?: "monthly" | "annual" }>;
      })
      .then((payload) => {
        if (payload.plan === "pro" || payload.billingPlan === "pro") {
          setBillingPlan("pro");
          setPlan("pro");
        }
      })
      .catch((err) => {
        console.error("[Mintomics] Failed to confirm checkout:", err);
      })
      .finally(() => {
        setBillingSyncState("synced");
      });
  }, [checkoutSessionId, checkoutState, searchParams]);

  const syncSavedProjects = async () => {
    try {
      const projects = await listSavedProjects();
      setSavedProjects(projects);
    } catch (err) {
      console.error("[Mintomics] Failed to sync projects:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load saved projects.";
      setError((current) => current ?? message);
    }
  };

  const startNewProject = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setPlan(billingPlan);
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
    setFormResetKey((value) => value + 1);
    void trackEvent("project_opened", {
      projectId: project.id,
      plan: project.plan,
    });
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
      void trackEvent("project_deleted", { projectId });
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
    setResult(null);
    setDraftInput(input);
    setLastSubmittedInput(input);
    void trackEvent("generation_started", {
      projectName: input.projectName,
      projectType: input.projectType,
    });

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
      setStatus("streaming");

      const parsed: TokenomicsOutput = await response.json();
      const savedProject = await saveProjectRecord({
        input,
        plan: effectivePlan,
        projectId: activeProjectId,
        result: parsed,
      });

      setActiveProjectId(savedProject.id);
      await syncSavedProjects();
      setResult(parsed);
      setStatus("complete");
      void trackEvent("generation_completed", {
        projectId: savedProject.id,
        readinessScore: parsed.investorReadinessScore,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
      void trackEvent("generation_failed", {
        projectName: input.projectName,
      });
    }
  };

  const retryLastGeneration = () => {
    void handleGenerate(lastSubmittedInput ?? draftInput);
  };

  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={null}>
        <SignupCompletionTracker plan={effectivePlan} />
      </Suspense>

      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-105">
            <BrandLogo
              variant="wordmark"
              width={220}
              height={56}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${effectivePlan === "pro"
                ? "border border-white/25 bg-white/10 text-white"
                : "border border-white/15 bg-white/5 text-gray-300"
                }`}
            >
              {billingSyncState === "verifying"
                ? "Confirming purchase..."
                : effectivePlan === "pro"
                  ? "Pro"
                  : "Free Plan"}
            </span>
            {status === "streaming" && (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Generating your mintomics model...
              </span>
            )}
            {status === "complete" && (
              <span className="text-green-400">✓ Generation complete</span>
            )}
            {billingSyncState === "verifying" && (
              <span className="text-gray-300">Verifying Stripe payment...</span>
            )}
            <AuthControls mode="app" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <ProjectHistorySidebar
            activeProjectId={activeProjectId}
            onCreateNew={startNewProject}
            onDeleteProject={handleDeleteProject}
            onOpenProject={openSavedProject}
            projects={savedProjects}
          />

          <div>
            {(status === "idle" || status === "error") && (
              <>
                <div className="mb-10 text-center">
                  <h1 className="mb-2 text-3xl font-bold text-white">
                    Design your mintomics
                  </h1>
                  <p className="text-gray-400">
                    Fill in your project details and get a complete model in about 60 seconds.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p>{error}</p>
                      <button
                        onClick={retryLastGeneration}
                        className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:border-red-300 hover:text-white"
                      >
                        Retry last generation
                      </button>
                    </div>
                  </div>
                )}

                <TokenomicsForm
                  initialValues={draftInput}
                  isLoading={isGenerating}
                  onSubmit={handleGenerate}
                  resetKey={formResetKey}
                  onStepCompleted={(stepIndex) => {
                    void trackEvent("wizard_step_completed", {
                      step: stepIndex + 1,
                    });
                  }}
                />
              </>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-6 py-32">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                <div className="text-center">
                  <h2 className="mb-2 text-xl font-semibold text-white">
                    Analyzing your project...
                  </h2>
                  <p className="max-w-md text-sm text-gray-400">
                    Mintomics is designing your allocation model, vesting schedules,
                    emission curve, and running red flag analysis.
                  </p>
                </div>
              </div>
            )}

            {status === "complete" && result && (
              <ResultsDashboard
                onEditInputs={() => {
                  setStatus("idle");
                  setResult(null);
                  setError(null);
                  setFormResetKey((value) => value + 1);
                }}
                plan={effectivePlan}
                result={result}
                onUpgradePreview={() => {
                  setPlan("pro");
                  void trackEvent("upgrade_completed", {
                    projectId: activeProjectId,
                    plan: "pro",
                  });
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

function SignupCompletionTracker({ plan }: { plan: PlanTier }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signup") !== "1") {
      return;
    }

    const trackingKey = "mintomics_signup_completed_tracked";
    if (typeof window !== "undefined" && window.localStorage.getItem(trackingKey) === "1") {
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(trackingKey, "1");
    }

    void trackEvent("signup_completed", {
      surface: "generate",
      plan,
    });
  }, [plan, searchParams]);

  return null;
}
