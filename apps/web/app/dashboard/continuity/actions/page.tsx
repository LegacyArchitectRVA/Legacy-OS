"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Action = { id: string; domain: string; title: string; reason: string; priority: string; status: string; evidenceRequired: boolean };

export default function ContinuityActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/continuity/actions").then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "Unable to load actions."); setActions(d.actions ?? []); }).catch((e) => setError(e.message)); }, []);
  return <main className="mx-auto max-w-5xl px-6 py-12"><div className="flex items-start justify-between gap-6"><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Legacy OS</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Continuity Actions</h1><p className="mt-3 max-w-2xl text-muted-foreground">Turn continuity gaps into concrete, evidence-backed work instead of leaving them as warnings.</p></div><Link href="/dashboard/continuity" className="rounded-md border px-4 py-2 text-sm">Readiness</Link></div>{error && <p className="mt-8 rounded-lg border p-4 text-sm">{error}</p>}<section className="mt-8 space-y-3">{actions.map((action) => <article key={action.id} className="rounded-xl border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-xs uppercase tracking-wide text-muted-foreground">{action.domain}</span><h2 className="mt-1 text-lg font-semibold">{action.title}</h2></div><span className="rounded-full border px-3 py-1 text-xs uppercase tracking-wide">{action.priority}</span></div><p className="mt-3 text-sm text-muted-foreground">{action.reason}</p><div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"><span className="rounded border px-2 py-1">Status: {action.status}</span>{action.evidenceRequired && <span className="rounded border px-2 py-1">Evidence required</span>}</div></article>)}{!actions.length && !error && <p className="rounded-xl border p-6 text-sm text-muted-foreground">No continuity actions are currently generated.</p>}</section></main>;
}
