"use client";

import { useEffect, useState } from "react";
import type { LifeManualDocument } from "../../lib/life-manual";

export default function LifeManualPage() {
  const [document, setDocument] = useState<LifeManualDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/life-manual", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to load Life Manual.");
        return payload as LifeManualDocument;
      })
      .then(setDocument)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load Life Manual."));
  }, []);

  if (error) return <main className="mx-auto max-w-3xl p-8"><h1 className="text-3xl font-semibold">Life Manual</h1><p className="mt-4">{error}</p></main>;
  if (!document) return <main className="mx-auto max-w-5xl p-8"><p>Loading Life Manual…</p></main>;

  const handoffStatus = document.handoff.ready ? "Successor-ready" : "Needs attention";

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-8 print:max-w-none print:p-0">
      <header className="border-b pb-6">
        <p className="text-sm uppercase tracking-widest opacity-60">Legacy OS</p>
        <h1 className="mt-2 text-4xl font-semibold">Life Manual</h1>
        <p className="mt-2 opacity-70">Revision {document.revision}</p>
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          <span>Readiness: {document.readiness.score}%</span>
          <span>Status: {document.readiness.status.replace("_", " ")}</span>
          <span>Open issues: {document.readiness.gaps}</span>
          <span>Handoff: {handoffStatus}</span>
        </div>
      </header>

      <section className="rounded-lg border p-5">
        <h2 className="text-2xl font-semibold">Successor Readiness</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div><p className="text-sm opacity-60">Completion</p><p className="text-2xl font-semibold">{document.handoff.completionPercent}%</p></div>
          <div><p className="text-sm opacity-60">Blocked</p><p className="text-2xl font-semibold">{document.handoff.blocked}</p></div>
          <div><p className="text-sm opacity-60">Evidence gaps</p><p className="text-2xl font-semibold">{document.handoff.evidenceOutstanding}</p></div>
          <div><p className="text-sm opacity-60">Invalid completions</p><p className="text-2xl font-semibold">{document.handoff.invalidCompleted}</p></div>
        </div>
        {document.handoff.nextAction && (
          <p className="mt-5 border-t pt-4 text-sm">
            Next priority: <strong>{document.actions.find((action) => action.id === document.handoff.nextAction?.actionId)?.title ?? document.handoff.nextAction.actionId}</strong>. {document.handoff.nextAction.reason === "unblocks_downstream_work" ? "This action unblocks downstream work." : "Continue this in-progress action."}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Start Here: First 72 Hours</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6">
          {document.first72Hours.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Seven Pillars</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {document.pillars.map((pillar) => (
            <article key={pillar.key} className="rounded-lg border p-4">
              <h3 className="font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-sm">{pillar.score}% · {pillar.status.replace("_", " ")} · {pillar.matchedMemories} supporting memories</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">What Needs To Happen</h2>
        <div className="mt-4 space-y-4">
          {document.actions.map((action) => (
            <article key={action.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{action.title}</h3>
                <span className="text-sm opacity-60">{action.state.replace("_", " ")}</span>
              </div>
              <p className="mt-2">{action.instruction}</p>
              {action.dependencies.length > 0 && <p className="mt-2 text-sm opacity-70">Dependencies: {action.dependencies.join(", ")}</p>}
              {action.evidenceRequired && <p className="mt-2 text-sm opacity-70">Evidence: {action.evidenceConfirmed ? "confirmed" : "required"}</p>}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Open Issues</h2>
        {document.openIssues.length ? <ul className="mt-4 list-disc space-y-2 pl-6">{document.openIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : <p className="mt-4">No open issues recorded.</p>}
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Important Decisions</h2>
        {document.importantDecisions.length ? <ul className="mt-4 list-disc space-y-2 pl-6">{document.importantDecisions.map((decision) => <li key={decision}>{decision}</li>)}</ul> : <p className="mt-4">No decisions recorded.</p>}
      </section>

      <footer className="border-t pt-6 text-sm opacity-60">
        Generated {new Date(document.generatedAt).toLocaleString()}. Verify critical information against its source before acting on it.
      </footer>
    </main>
  );
}
