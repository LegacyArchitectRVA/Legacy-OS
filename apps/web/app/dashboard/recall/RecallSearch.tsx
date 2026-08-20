"use client";

import { FormEvent, useState } from "react";

type Memory = { id: string; title: string; narrative: string; context: string; evidenceClass: string; confidence?: number; provenanceComplete?: boolean };

export default function RecallSearch() {
  const [query, setQuery] = useState(""); const [results, setResults] = useState<Memory[]>([]); const [status, setStatus] = useState("");
  async function search(event: FormEvent) { event.preventDefault(); setStatus("Searching…"); const response = await fetch(`/api/recall/memories?q=${encodeURIComponent(query)}`); const data = await response.json(); if (!response.ok) { setStatus(data.error ?? "Search failed."); return; } setResults(data.memories ?? []); setStatus(`${data.memories?.length ?? 0} memories found.`); }
  return <section className="mt-8 rounded-xl border p-6"><h2 className="text-xl font-semibold">Search Recall</h2><form onSubmit={search} className="mt-4 flex gap-3"><input className="min-w-0 flex-1 rounded-md border p-2" aria-label="Search memories" placeholder="Search memories…" value={query} onChange={(e) => setQuery(e.target.value)} /><button className="rounded-md border px-4 py-2 text-sm" type="submit">Search</button></form><p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{status}</p><div className="mt-5 grid gap-3">{results.map((memory) => <article key={memory.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{memory.title}</h3><span className="rounded-full border px-2 py-1 text-xs">{memory.evidenceClass}</span></div><p className="mt-2 text-sm text-muted-foreground">{memory.narrative}</p><p className="mt-3 text-xs text-muted-foreground">{memory.context} · confidence {memory.confidence ?? "not set"} · provenance {memory.provenanceComplete ? "complete" : "incomplete"}</p></article>)}</div></section>;
}
