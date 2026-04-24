"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

type LeadState = {
  name: string;
  email: string;
  company: string;
  role: string;
  message: string;
};

const INITIAL_STATE: LeadState = {
  name: "",
  email: "",
  company: "",
  role: "",
  message: "",
};

export default function AgencyLeadForm() {
  const [form, setForm] = useState<LeadState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof LeadState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/sales/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit request.");
      }

      setForm(INITIAL_STATE);
      setStatus("success");
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Failed to submit request.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Full name
          </span>
          <input
            type="text"
            value={form.name}
            onChange={updateField("name")}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/25"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Work email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={updateField("email")}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/25"
            placeholder="name@company.com"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Company
          </span>
          <input
            type="text"
            value={form.company}
            onChange={updateField("company")}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/25"
            placeholder="Studio or company name"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Role
          </span>
          <input
            type="text"
            value={form.role}
            onChange={updateField("role")}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/25"
            placeholder="Founder, consultant, operator"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
          What are you building?
        </span>
        <textarea
          value={form.message}
          onChange={updateField("message")}
          required
          rows={5}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/25"
          placeholder="Tell us about your client volume, workflow, and what you need from Agency."
        />
      </label>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {status === "success" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Thanks. Your Agency request is in our queue. We will follow up with next steps.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-70"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send request
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
