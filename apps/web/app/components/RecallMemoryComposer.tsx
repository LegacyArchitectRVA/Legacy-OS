"use client";

import { FormEvent, useState } from "react";

type Context = "personal" | "family" | "business";
type Evidence = "known" | "reconstructed" | "inferred" | "unknown";

export default function RecallMemoryComposer({ context = "personal" }: { context?: Context }) {
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [evidenceClass, setEvidenceClass] = useState<Evidence>("known");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/recall/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, title, narrative, evidenceClass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save memory.");
      setTitle("");
      setNarrative("");
      setStatus("Memory saved to the Recall session.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save memory.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Add a Recall</p>
      <h2 className="mt-2 text-xl font-semibold">Preserve a memory</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">Capture the story first. Evidence and media can be attached as the Recall record grows.</p>
      <div className="mt-5 space-y-4">
        <label className="block text-sm text-white/70">Title<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={2} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="The first fishing trip" /></label>
        <label className="block text-sm text-white/70">Story<textarea value={narrative} onChange={(event) => setNarrative(event.target.value)} required minLength={2} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="What happened, who was there, and what should be remembered?" /></label>
        <label className="block text-sm text-white/70">Evidence<select value={evidenceClass} onChange={(event) => setEvidenceClass(event.target.value as Evidence)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"><option value="known">Known · directly supported</option><option value="reconstructed">Reconstructed · derived from evidence</option><option value="inferred">Inferred · supported by multiple signals</option><option value="unknown">Unknown · not enough evidence</option></select></label>
        <button disabled={saving} type="submit" className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{saving ? "Saving…" : "Save Recall"}</button>
        <p className="min-h-5 text-xs text-white/50" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
