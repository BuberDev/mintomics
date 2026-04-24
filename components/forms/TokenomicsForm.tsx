"use client";

import { useEffect, useMemo, useState } from "react";
import { createDefaultTokenomicsInput } from "@/lib/mintomics/defaultInput";
import type { TokenomicsInput, ProjectType, FundingStage } from "@/types/mintomics";

interface Props {
  initialValues?: TokenomicsInput;
  onSubmit: (input: TokenomicsInput) => void;
  isLoading: boolean;
  resetKey?: string | number;
  onStepCompleted?: (stepIndex: number) => void;
}

const STEPS = ["Project Basics", "Token Supply & Funding", "Allocation & Vesting"];

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "defi_dex", label: "Decentralized Exchange (DEX)" },
  { value: "defi_lending", label: "DeFi Lending Protocol" },
  { value: "gamefi", label: "GameFi / Play-to-Earn" },
  { value: "dao", label: "DAO / Governance" },
  { value: "rwa", label: "Real-World Asset Tokenization" },
  { value: "infra_l1", label: "Layer 1 Blockchain" },
  { value: "infra_l2", label: "Layer 2 / Rollup" },
  { value: "nft_marketplace", label: "NFT Marketplace" },
  { value: "social", label: "SocialFi" },
  { value: "other", label: "Other" },
];

export default function TokenomicsForm({
  initialValues,
  onSubmit,
  isLoading,
  resetKey,
  onStepCompleted,
}: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<TokenomicsInput>(
    initialValues ?? createDefaultTokenomicsInput(),
  );

  useEffect(() => {
    setValues(initialValues ?? createDefaultTokenomicsInput());
    setStep(0);
  }, [initialValues, resetKey]);

  const allocationTotal = useMemo(
    () =>
      values.teamPercent +
      values.investorsPercent +
      values.communityPercent +
      values.treasuryPercent +
      values.ecosystemPercent +
      values.publicSalePercent,
    [
      values.teamPercent,
      values.investorsPercent,
      values.communityPercent,
      values.treasuryPercent,
      values.ecosystemPercent,
      values.publicSalePercent,
    ],
  );

  const allocationTotalValid = allocationTotal <= 100;

  const vestingFields = [
    {
      key: "teamCliffMonths",
      label: "Team Cliff (months)",
      tooltip: "How long core team tokens stay locked before vesting starts.",
    },
    {
      key: "teamVestingMonths",
      label: "Team Vesting (months)",
      tooltip: "How long it takes for the team allocation to unlock linearly.",
    },
    {
      key: "investorCliffMonths",
      label: "Investor Cliff (months)",
      tooltip: "How long investor tokens stay locked before vesting starts.",
    },
    {
      key: "investorVestingMonths",
      label: "Investor Vesting (months)",
      tooltip: "How long it takes for investor tokens to unlock linearly.",
    },
  ] as const;

  const set = (key: keyof TokenomicsInput, value: string | number) =>
    setValues((v) => ({ ...v, [key]: value }));

  const isStep0Valid =
    values.projectName.trim().length > 1 &&
    values.tokenSymbol.trim().length > 1 &&
    values.projectDescription.trim().length > 20;

  const isStep1Valid =
    values.totalSupply > 0 &&
    values.tokenPriceUsd > 0 &&
    values.targetRaiseUsd > 0;

  const canSubmit =
    isStep0Valid &&
    isStep1Valid &&
    allocationTotalValid &&
    values.mainUseCase.trim().length > 5;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i < step ? "bg-white text-black" :
                  i === step ? "border-2 border-white text-white" :
                    "border border-white/20 text-gray-500"
                }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-white" : "text-gray-500"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-white/70" : "bg-white/15"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Project Basics */}
      {step === 0 && (
        <div className="space-y-5">
          <Field
            label="Project Name"
            required
            tooltip="The public name of the project, for example LiquidSwap Protocol."
          >
            <input
              type="text"
              value={values.projectName}
              onChange={(e) => set("projectName", e.target.value)}
              placeholder="e.g. LiquidSwap Protocol"
              className="input-field"
            />
          </Field>

          <Field label="Token Symbol" required tooltip="The ticker symbol for your token (e.g. ETH, AAVE)">
            <input
              type="text"
              value={values.tokenSymbol}
              onChange={(e) => set("tokenSymbol", e.target.value.toUpperCase())}
              placeholder="e.g. LSP"
              maxLength={10}
              className="input-field"
            />
          </Field>

          <Field
            label="Project Type"
            required
            tooltip="Pick the closest category. It helps the AI apply the right token benchmarks."
          >
            <select
              value={values.projectType}
              onChange={(e) => set("projectType", e.target.value as ProjectType)}
              className="input-field"
            >
              {PROJECT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field
            label="Project Description"
            required
            tooltip="Describe what your protocol does in 2-3 sentences. This helps AI tailor the mintomics to your use case."
          >
            <textarea
              value={values.projectDescription}
              onChange={(e) => set("projectDescription", e.target.value)}
              placeholder="e.g. A decentralized lending protocol on Ethereum that allows users to lend and borrow crypto assets with algorithmic interest rates..."
              rows={4}
              className="input-field resize-none"
            />
          </Field>
        </div>
      )}

      {/* Step 1 — Token Supply & Funding */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Supply" required tooltip="Maximum number of tokens that will ever exist">
              <input
                type="number"
                value={values.totalSupply}
                onChange={(e) => set("totalSupply", Number(e.target.value))}
                className="input-field"
              />
            </Field>
            <Field
              label="Funding Stage"
              required
              tooltip="Choose the funding phase that best matches your project right now."
            >
              <select
                value={values.fundingStage}
                onChange={(e) => set("fundingStage", e.target.value as FundingStage)}
                className="input-field"
              >
                <option value="pre_seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series_a">Series A</option>
                <option value="public_only">Public Only (No VCs)</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Target Raise (USD)" required tooltip="How much do you plan to raise in total?">
              <input
                type="number"
                value={values.targetRaiseUsd}
                onChange={(e) => set("targetRaiseUsd", Number(e.target.value))}
                className="input-field"
              />
            </Field>
            <Field label="Seed Token Price (USD)" required tooltip="Price per token in the seed round">
              <input
                type="number"
                value={values.tokenPriceUsd}
                step="0.001"
                onChange={(e) => set("tokenPriceUsd", Number(e.target.value))}
                className="input-field"
              />
            </Field>
          </div>

          <Field
            label="Months Until TGE"
            tooltip="How many months until the token launch. TGE means Token Generation Event."
          >
            <input
              type="number"
              value={values.launchTimelineMonths}
              min={1}
              max={36}
              onChange={(e) => set("launchTimelineMonths", Number(e.target.value))}
              className="input-field"
            />
          </Field>

          <Field
            label="Primary Token Use Case"
            required
            tooltip="What is the main utility of your token within the protocol? e.g. governance voting, staking for yield, fee discounts, in-game currency"
          >
            <input
              type="text"
              value={values.mainUseCase}
              onChange={(e) => set("mainUseCase", e.target.value)}
              placeholder="e.g. Governance voting + protocol fee sharing + liquidity mining rewards"
              className="input-field"
            />
          </Field>
        </div>
      )}

      {/* Step 2 — Allocation & Vesting */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-gray-300">
            💡 Leave all values at 0 to let AI recommend the allocation mix.
            If you enter preferences, the combined total must stay at or below 100%.
          </div>

          <div
            className={`rounded-lg border p-4 text-sm ${
              allocationTotalValid
                ? "border-white/15 bg-white/5 text-gray-300"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium">
                Allocation preference total: {allocationTotal.toFixed(1)}%
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                {allocationTotalValid ? "Within limit" : "Over 100%"}
              </p>
            </div>
            <p className="mt-2 text-xs leading-6 opacity-90">
              0% means “let AI decide.” If you define a split, we validate it before generation.
            </p>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Allocation Preferences (%)</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["teamPercent", "Team"],
                ["investorsPercent", "Investors"],
                ["communityPercent", "Community"],
                ["treasuryPercent", "Treasury"],
                ["ecosystemPercent", "Ecosystem"],
                ["publicSalePercent", "Public Sale"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  tooltip="0 means let the AI decide this bucket."
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={values[key as keyof TokenomicsInput] as number}
                      min={0}
                      max={100}
                      onChange={(e) => set(key as keyof TokenomicsInput, Number(e.target.value))}
                      className="input-field"
                    />
                    <span className="text-gray-400 text-sm flex-shrink-0">%</span>
                  </div>
                </Field>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Vesting Preferences</h3>
            {/* These defaults let founders express lock-up preferences in plain language. */}
            <div className="grid grid-cols-2 gap-3">
              {vestingFields.map(({ key, label, tooltip }) => (
                <Field key={key} label={label} tooltip={tooltip}>
                  <input
                    type="number"
                    value={values[key as keyof TokenomicsInput] as number}
                    min={0}
                    max={60}
                    onChange={(e) => set(key as keyof TokenomicsInput, Number(e.target.value))}
                    className="input-field"
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 border border-white/20 hover:border-white/40 text-gray-300 py-3 rounded-xl transition-colors"
          >
            ← Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => {
              onStepCompleted?.(step);
              setStep(step + 1);
            }}
            disabled={step === 0 ? !isStep0Valid : !isStep1Valid}
            className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-semibold transition-colors"
          >
            Next: {STEPS[step + 1]} →
          </button>
        ) : (
          <button
            onClick={() => onSubmit(values)}
            disabled={!canSubmit || isLoading}
            className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-semibold transition-colors"
          >
            {isLoading ? "Generating..." : "Generate Tokenomics ✦"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Small helper component ────────────────────────────────────────────────
function Field({
  label,
  children,
  required,
  tooltip,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-white ml-0.5">*</span>}
        {tooltip && (
          <span
            title={tooltip}
            className="ml-1.5 text-gray-500 cursor-help text-xs border border-gray-600 rounded-full px-1"
          >
            ?
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
