"use client";

import { FormEvent, useState } from "react";

type Evidence = "verified" | "reconstructed";

type RecreationResult = {
  response: string;
  mode: Evidence;
  disclosure: string;
  evidence: Array<{ id: string; type: string; title: string; evidence: string }>;
  context: Array<{ label: string; value: string }>;
};

export interface MemoryRecreationProps {
  personName: string;
  personId: string;
  question?: string;
}

export default function MemoryRecreation({
  personName,
  personId,
  question = "What do you remember?",
}: MemoryRecreationProps) {
  const [prompt, setPrompt] = useState(question);
  const [result, setResult] = useState<RecreationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/recall/recreation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to recall this memory.");
      setResult(data as RecreationResult);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to recall this memory.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="memory-recreation-heading" className="rounded-2xl border border-cyan-200/20 bg-slate-950 p-5 text-white sm:p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Legacy Recall</p>
      <h2 id="memory-recreation-heading" className="mt-1 text-xl font-semibold">Ask about a memory of {personName}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Legacy Recall answers from your preserved evidence first. If it has to reconstruct anything, it says so clearly and shows the sources it used.</p>

      <form onSubmit={ask} className="mt-5">
        <label className="text-sm font-medium text-white/50">
          Ask a memory question
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
        </label>
        <button type="submit" disabled={busy} className="mt-3 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy ? "Recalling…" : "Recall this moment"}</button>
      </form>

      {result && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">About {personName}</p>
          <p className="mt-2 text-base leading-7 text-white/80">{result.response}</p>
          <p className="mt-3 text-xs leading-5 text-white/40">{result.disclosure}</p>
          {result.context.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Real context</p>
              <ul className="mt-2 space-y-1 text-sm text-white/60">
                {result.context.map((fact) => <li key={fact.label}>{fact.label}: {fact.value}</li>)}
              </ul>
            </div>
          )}
          {result.evidence.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Evidence used</p>
              <ul className="mt-2 space-y-1 text-sm text-white/60">
                {result.evidence.map((source) => <li key={source.id}>{source.title} · {source.type}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      {status && <p className="mt-3 text-xs text-red-300/70" role="alert">{status}</p>}
    </section>
  );
}
