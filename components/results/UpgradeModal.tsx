"use client";

type UpgradeReason = "export" | "red_flags";

interface UpgradeModalProps {
  hiddenRedFlagsCount: number;
  isOpen: boolean;
  reason: UpgradeReason;
  onClose: () => void;
}

const COPY: Record<UpgradeReason, { title: string; description: string }> = {
  export: {
    title: "PDF Export Is a Pro Feature",
    description:
      "Free users can generate and review a model, but polished investor-facing export is reserved for Pro.",
  },
  red_flags: {
    title: "Unlock the Full Red Flag Report",
    description:
      "The free tier shows only a preview. Pro reveals the complete investor-risk analysis and recommended fixes.",
  },
};

export default function UpgradeModal({
  hiddenRedFlagsCount,
  isOpen,
  reason,
  onClose,
}: UpgradeModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-pdf-exclude="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a0a0a] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
              Upgrade Prompt
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{COPY[reason].title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {COPY[reason].description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-white/35 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">Pro unlocks:</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li>Full investor red flag report with all recommendations</li>
              <li>PDF export of the branded mintomics report</li>
              <li>Unlimited iterations for founder and advisor workflows</li>
            </ul>
          </div>

          {hiddenRedFlagsCount > 0 && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              {hiddenRedFlagsCount} additional red flag
              {hiddenRedFlagsCount === 1 ? "" : "s"} are hidden in the free preview.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="/pricing"
            className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-medium text-gray-300 transition-colors hover:border-white/35 hover:text-white"
          >
            View Pricing
          </a>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
