"use client";

import { FormEvent, useState } from "react";

type Context = "personal" | "family" | "business";
type Evidence = "known" | "reconstructed" | "inferred" | "unknown";
type EvidenceKind = "photo" | "video" | "audio" | "document" | "story" | "memory" | "relationship";

export default function EvidenceVault({ context = "personal" }: { context?: Context }) {
  const [kind, setKind] = useState<EvidenceKind>("memory");
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [evidenceClass, setEvidenceClass] = useState<Evidence>("known");
  const [people, setPeople] = useState("");
  const [sourceRefs, setSourceRefs] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setStatus("");
    try {
      const response = await fetch("/api/recall/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          title,
          narrative: `${kind}: ${narrative}`,
          evidenceClass,
          people: people.split(",").map(v => v.trim()).filter(Boolean),
          sourceRefs: sourceRefs.split(",").map(v => v.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save evidence.");
      setTitle(""); setNarrative(""); setPeople(""); setSourceRefs(""); setStatus("Evidence preserved in the Recall record.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to save evidence."); }
    finally { setSaving(false); }
  }

  return <section aria-labelledby="evidence-vault-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Legacy Recall</p>
    <h2 id="evidence-vault-heading" className="mt-2 text-2xl font-semibold">Evidence Vault</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Build a person's evidence record from memories, stories, photographs, recordings, documents, and relationships. Keep the source attached so reconstruction knows what is fact and what is derived.</p>
    <form onSubmit={save} className="mt-6 grid gap-4">
      <label className="text-sm text-white/70">Evidence type<select value={kind} onChange={e => setKind(e.target.value as EvidenceKind)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{["photo","video","audio","document","story","memory","relationship"].map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      <label className="text-sm text-white/70">Title<input required minLength={2} value={title} onChange={e => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" placeholder="The first fishing trip" /></label>
      <label className="text-sm text-white/70">Description or story<textarea required minLength={2} rows={6} value={narrative} onChange={e => setNarrative(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" placeholder="Tell what happened, what the evidence shows, or what should be remembered..." /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-white/70">People<input value={people} onChange={e => setPeople(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" placeholder="Dad, Mom, Craig" /></label>
        <label className="text-sm text-white/70">Source references<input value={sourceRefs} onChange={e => setSourceRefs(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" placeholder="photo-12, audio-04, document-2" /></label>
      </div>
      <label className="text-sm text-white/70">Evidence status<select value={evidenceClass} onChange={e => setEvidenceClass(e.target.value as Evidence)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"><option value="known">Known · directly supported</option><option value="reconstructed">Reconstructed · derived from evidence</option><option value="inferred">Inferred · supported by multiple signals</option><option value="unknown">Unknown · needs more evidence</option></select></label>
      <button disabled={saving} className="w-fit rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{saving ? "Preserving…" : "Preserve evidence"}</button>
      <p role="status" aria-live="polite" className="min-h-5 text-sm text-white/50">{status}</p>
    </form>
  </section>;
}
