"use client";

import { useCallback, useEffect, useState } from "react";

interface Evidence { id: string; type: string; label: string; uri: string; description?: string | null; verificationStatus: string; capturedAt?: string | null; }

export default function EvidencePanel({ memoryId }: { memoryId: string }) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [status, setStatus] = useState("Loading evidence…");

  const load = useCallback(async () => {
    const response = await fetch(`/api/recall/evidence?memoryId=${encodeURIComponent(memoryId)}`);
    const data = await response.json();
    if (!response.ok) { setStatus(data.error ?? "Unable to load evidence."); return; }
    setEvidence(data.evidence ?? []); setStatus("");
  }, [memoryId]);

  useEffect(() => {
    const task = Promise.resolve().then(load);
    return () => { void task.catch(() => undefined); };
  }, [load]);

  async function verify(id: string, verificationStatus: "verified" | "disputed") {
    setStatus("Updating verification…");
    const response = await fetch(`/api/recall/evidence/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationStatus }) });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error ?? "Unable to update verification."); return; }
    setEvidence((items) => items.map((item) => item.id === id ? { ...item, verificationStatus } : item)); setStatus("");
  }

  return <section className="mt-6 rounded-xl border p-6">
    <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Evidence review</h2>{status && <span className="text-sm text-muted-foreground" aria-live="polite">{status}</span>}</div>
    {evidence.length === 0 && !status && <p className="mt-3 text-sm text-muted-foreground">No evidence attached yet.</p>}
    <div className="mt-4 grid gap-3">
      {evidence.map((item) => <article key={item.id} className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-medium">{item.label}</h3><p className="text-xs uppercase tracking-wide text-muted-foreground">{item.type} · {item.verificationStatus}</p></div><a className="text-sm underline" href={item.uri} target="_blank" rel="noreferrer">Open source</a></div>
        {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
        {item.verificationStatus === "unverified" && <div className="mt-3 flex gap-2"><button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => void verify(item.id, "verified")}>Mark verified</button><button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => void verify(item.id, "disputed")}>Mark disputed</button></div>}
      </article>)}
    </div>
  </section>;
}
