import Link from "next/link";
import RecallComposer from "./RecallComposer";
import RecallSearch from "./RecallSearch";
import RecallAnalysis from "./RecallAnalysis";
import MemoryRecreation from "../../components/MemoryRecreation";
import { getRecallUserId, listRecallMemories } from "../../../lib/recall-store";

const intelligenceLabels = { known: "Known", reconstructed: "Reconstructed", inferred: "Inferred", unknown: "Unknown" } as const;

export default async function RecallPage() {
  const userId = await getRecallUserId();
  let people: string[] = [];
  if (userId) {
    try {
      const memories = await listRecallMemories(undefined, userId);
      people = [...new Set(memories.flatMap((memory) => memory.people ?? []).filter((person): person is string => typeof person === "string" && person.trim().length > 0))];
    } catch {
      people = [];
    }
  }
  const primaryPerson = people[0];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Legacy OS</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Legacy Recall</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">A living record of what is known, reconstructed, inferred, and still unknown, with the evidence trail kept visible.</p>
        </div>
        <Link className="rounded-md border px-4 py-2 text-sm" href="/dashboard">Dashboard</Link>
      </div>

      <section className="mb-8 rounded-2xl border border-cyan-200/20 bg-slate-950 p-4 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-300">Primary experience</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Memory Recreation</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">Ask about a real moment and see what Legacy Recall can establish from preserved evidence before it reconstructs anything.</p>
        </div>
        {primaryPerson ? (
          <MemoryRecreation personName={primaryPerson} personId={primaryPerson.trim().toLowerCase()} />
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            Preserve a memory with a person attached before starting Memory Recreation. Legacy Recall will use the names attached to your authenticated memories rather than a demo identity.
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(intelligenceLabels).map(([key, label]) => (
          <article key={key} className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Evidence class</p>
            <h2 className="mt-2 text-xl font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{key === "known" && "Supported by direct source references."}{key === "reconstructed" && "Assembled from available supporting context."}{key === "inferred" && "A conclusion that still requires confirmation."}{key === "unknown" && "Not established yet. Do not treat as fact."}</p>
          </article>
        ))}
      </section>

      <RecallSearch />
      <RecallAnalysis />
      <RecallComposer />
      <section className="mt-8 rounded-xl border p-6"><h2 className="text-xl font-semibold">Evidence trail</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Memories can carry documents, photos, audio, video, links, and notes. Provenance and verification stay visible.</p></section>
    </main>
  );
}
