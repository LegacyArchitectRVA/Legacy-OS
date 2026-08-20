import Link from "next/link";

const intelligenceLabels = {
  known: "Known",
  reconstructed: "Reconstructed",
  inferred: "Inferred",
  unknown: "Unknown",
} as const;

export default function RecallPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Legacy OS</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Legacy Recall</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A living record of what is known, reconstructed, inferred, and still unknown, with the evidence trail kept visible.
          </p>
        </div>
        <Link className="rounded-md border px-4 py-2 text-sm" href="/dashboard">Dashboard</Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(intelligenceLabels).map(([key, label]) => (
          <article key={key} className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Evidence class</p>
            <h2 className="mt-2 text-xl font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {key === "known" && "Supported by direct source references."}
              {key === "reconstructed" && "Assembled from available supporting context."}
              {key === "inferred" && "A conclusion that still requires confirmation."}
              {key === "unknown" && "Not established yet. Do not treat as fact."}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Recall evidence trail</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Memories can carry documents, photos, audio, video, links, and notes. Each item can retain provenance, capture time, and verification state so the record remains useful to the person who created it and to the person who may eventually need it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" href="/api/recall/memories">View Recall API</Link>
          <Link className="rounded-md border px-4 py-2 text-sm" href="/dashboard">Back to Legacy OS</Link>
        </div>
      </section>
    </main>
  );
}
