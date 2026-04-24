"use client";

import type { SavedTokenomicsProject } from "@/types/mintomics";

interface ProjectHistorySidebarProps {
  activeProjectId: string | null;
  onCreateNew: () => void;
  onDeleteProject: (projectId: string) => void;
  onOpenProject: (project: SavedTokenomicsProject) => void;
  projects: SavedTokenomicsProject[];
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProjectHistorySidebar({
  activeProjectId,
  onCreateNew,
  onDeleteProject,
  onOpenProject,
  projects,
}: ProjectHistorySidebarProps) {
  return (
    <aside className="space-y-4">
      <section className="glass rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
          Workspace
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Saved Projects</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Your generated mintomics models are stored in your workspace database for reload and iteration.
        </p>
        <button
          onClick={onCreateNew}
          className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
        >
          New Project
        </button>
      </section>

      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            Recent History
          </h3>
          <span className="text-xs text-gray-500">{projects.length} saved</span>
        </div>

        {projects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
            Generate your first model and it will appear here for quick reload and iteration.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {projects.map((project) => {
              const isActive = project.id === activeProjectId;

              return (
                <div
                  key={project.id}
                  className={`rounded-xl border p-4 transition-colors ${isActive
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{project.result.projectName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                        {project.result.tokenSymbol} • {project.plan}
                      </p>
                    </div>
                    {isActive && (
                      <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">Readiness</p>
                      <p className="mt-1 font-semibold text-white">
                        {project.result.investorReadinessScore}/100
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">Updated</p>
                      <p className="mt-1 font-semibold text-white">
                        {formatTimestamp(project.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onOpenProject(project)}
                      className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-200 transition-colors hover:border-white/35 hover:text-white"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="rounded-lg border border-red-500/25 px-3 py-2 text-sm text-red-300 transition-colors hover:border-red-500/45 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
}
