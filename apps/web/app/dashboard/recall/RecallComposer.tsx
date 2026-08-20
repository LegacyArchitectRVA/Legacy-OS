"use client";

import { FormEvent, useState } from "react";

const classes = ["known", "reconstructed", "inferred", "unknown"] as const;
const contexts = ["personal", "family", "business"] as const;
const evidenceTypes = ["document", "photo", "audio", "video", "link", "note"] as const;

export default function RecallComposer() {
  const [status, setStatus] = useState("");
  const [memoryId, setMemoryId] = useState<string | null>(null);
  const [form, setForm] = useState({ context: "personal", title: "", narrative: "", evidenceClass: "known", confidence: "" });
  const [evidence, setEvidence] = useState({ type: "document", label: "", uri: "", description: "" });

  async function submit(event: FormEvent) {
    event.preventDefault(); setStatus("Saving…");
    const response = await fetch("/api/recall/memories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, confidence: form.confidence ? Number(form.confidence) : undefined }) });
    const data = await response.json();
    setStatus(response.ok ? `Saved as ${data.intelligence?.evidenceClass ?? "memory"}.` : data.error ?? "Unable to save.");
    if (response.ok) { setMemoryId(data.memory.id); setForm({ context: form.context, title: "", narrative: "", evidenceClass: form.evidenceClass, confidence: "" }); }
  }

  async function attachEvidence(event: FormEvent) {
    event.preventDefault(); if (!memoryId) return;
    setStatus("Attaching evidence…");
    const response = await fetch("/api/recall/evidence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memoryId, ...evidence }) });
    const data = await response.json(); setStatus(response.ok ? "Evidence attached." : data.error ?? "Unable to attach evidence.");
    if (response.ok) setEvidence({ type: evidence.type, label: "", uri: "", description: "" });
  }

  return <>
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
    {memoryId && <form onSubmit={attachEvidence} className="mt-6 rounded-xl border p-6">
      <h2 className="text-xl font-semibold">Attach supporting evidence</h2>
      <p className="mt-2 text-sm text-muted-foreground">Keep the source alongside the memory so future readers can verify it.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">Type<select className="rounded-md border p-2" value={evidence.type} onChange={(e) => setEvidence({ ...evidence, type: e.target.value })}>{evidenceTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Label<input required className="rounded-md border p-2" value={evidence.label} onChange={(e) => setEvidence({ ...evidence, label: e.target.value })} /></label>
      </div>
      <label className="mt-4 grid gap-2 text-sm">Source URI<input required type="url" className="rounded-md border p-2" placeholder="https://…" value={evidence.uri} onChange={(e) => setEvidence({ ...evidence, uri: e.target.value })} /></label>
      <label className="mt-4 grid gap-2 text-sm">Description<textarea rows={3} className="rounded-md border p-2" value={evidence.description} onChange={(e) => setEvidence({ ...evidence, description: e.target.value })} /></label>
      <button className="mt-4 rounded-md border px-4 py-2 text-sm" type="submit">Attach evidence</button>
    </form>}
  </>;
}
