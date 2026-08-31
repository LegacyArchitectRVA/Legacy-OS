"use client";

import { FormEvent, useState } from "react";

type EvidenceKind = "photo" | "video" | "audio" | "document" | "story" | "memory" | "relationship";
type Confidence = "verified" | "supported" | "reconstructed";

export default function RecallEvidenceVault({ personId = "demo-dad" }: { personId?: string }) {
  const [kind, setKind] = useState<EvidenceKind>("photo");
  const [title, setTitle] = useState("");
  const [sourceUri, setSourceUri] = useState("");
  const [confidence, setConfidence] = useState<Confidence>("verified");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/recall/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "personal",
          title,
          narrative: `Evidence item for ${personId}: ${title}`,
          evidenceClass: confidence === "verified" ? "known" : confidence === "supported" ? "inferred" : "reconstructed",
          people: [personId],
          sourceRefs: sourceUri ? [sourceUri] : [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save evidence.");
      setTitle("");
      setSourceUri("");
      setStatus(`${kind} evidence added to Recall.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save evidence.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white" aria-labelledby="evidence-vault-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Evidence Vault</p>
      <h2 id="evidence-vault-heading" className="mt-2 text-xl font-semibold">Build the person, one piece of evidence at a time.</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">Photos, recordings, documents, stories, memories, and relationships become source material for Legacy Recall.</p>
      <form onSubmit={addEvidence} className="mt-5 grid gap-4">
        <label className="text-sm text-white/70">Evidence type<select value={kind} onChange={(e) => setKind(e.target.value as EvidenceKind)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{["photo","video","audio","document","story","memory","relationship"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-sm text-white/70">Title<input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="First fishing trip photo" /></label>
        <label className="text-sm text-white/70">Source or file reference<input value={sourceUri} onChange={(e) => setSourceUri(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="Optional source reference" /></label>
        <label className="text-sm text-white/70">Confidence<select value={confidence} onChange={(e) => setConfidence(e.target.value as Confidence)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"><option value="verified">Verified</option><option value="supported">Supported</option><option value="reconstructed">Reconstructed</option></select></label>
        <button disabled={saving} type="submit" className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{saving ? "Adding…" : "Add evidence"}</button>
        <p className="min-h-5 text-xs text-white/50" aria-live="polite">{status}</p>
      </form>
    </section>
  );
}
