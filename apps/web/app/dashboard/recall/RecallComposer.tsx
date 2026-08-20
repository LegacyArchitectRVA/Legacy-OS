"use client";

import { FormEvent, useState } from "react";

const classes = ["known", "reconstructed", "inferred", "unknown"] as const;
const contexts = ["personal", "family", "business"] as const;

export default function RecallComposer() {
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ context: "personal", title: "", narrative: "", evidenceClass: "known", confidence: "" });

  async function submit(event: FormEvent) {
    event.preventDefault(); setStatus("Saving…");
    const response = await fetch("/api/recall/memories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, confidence: form.confidence ? Number(form.confidence) : undefined }) });
    const data = await response.json();
    setStatus(response.ok ? `Saved as ${data.intelligence?.evidenceClass ?? "memory"}.` : data.error ?? "Unable to save.");
    if (response.ok) setForm({ context: form.context, title: "", narrative: "", evidenceClass: form.evidenceClass, confidence: "" });
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-xl border p-6">
      <h2 className="text-xl font-semibold">Capture a memory</h2>
      <p className="mt-2 text-sm text-muted-foreground">Record what you know without forcing certainty where certainty doesn’t exist.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">Context<select className="rounded-md border p-2" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })}>{contexts.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Evidence class<select className="rounded-md border p-2" value={form.evidenceClass} onChange={(e) => setForm({ ...form, evidenceClass: e.target.value })}>{classes.map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <label className="mt-4 grid gap-2 text-sm">Title<input required className="rounded-md border p-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label className="mt-4 grid gap-2 text-sm">Narrative<textarea required rows={5} className="rounded-md border p-2" value={form.narrative} onChange={(e) => setForm({ ...form, narrative: e.target.value })} /></label>
      <label className="mt-4 grid gap-2 text-sm">Confidence, optional<input type="number" min="0" max="1" step="0.01" className="rounded-md border p-2" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })} /></label>
      <div className="mt-5 flex items-center gap-4"><button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" type="submit">Save memory</button><span className="text-sm text-muted-foreground" aria-live="polite">{status}</span></div>
    </form>
  );
}
