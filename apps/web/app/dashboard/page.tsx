import Link from "next/link";
import ClipRecorder from "../components/ClipRecorder";

export default function Dashboard() {
  const modules = ["Business Brain", "Continuity Vault", "Executive Advisor", "Production Assistant", "Legacy Score"];
  return (
    <main className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Legacy OS</p>
          <h1 className="text-3xl font-bold">LegacyOS Dashboard</h1>
        </div>
        <Link href="/os" className="rounded-md border px-4 py-2 text-sm font-semibold transition hover:bg-muted">Open Command Center</Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => <div key={module} className="rounded border p-6">{module}</div>)}
        <Link href="/dashboard/recall" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Legacy Recall</div><p className="mt-2 text-sm text-muted-foreground">Find memories, evidence, and provenance behind your continuity record.</p></Link>
        <Link href="/dashboard/continuity" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Continuity Readiness</div><p className="mt-2 text-sm text-muted-foreground">See coverage, readiness, and continuity gaps.</p></Link>
        <Link href="/dashboard/visual-recreation" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Visual Recreation</div><p className="mt-2 text-sm text-muted-foreground">Explore reconstructed people, business, digital systems, assets, and timeline.</p></Link>
        <Link href="/dashboard/successor" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Successor Mode</div><p className="mt-2 text-sm text-muted-foreground">Turn the continuity record into a successor-ready set of actions, unknowns, and evidence warnings.</p></Link>
        <Link href="/dashboard/clips" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Clip Library</div><p className="mt-2 text-sm text-muted-foreground">Review private voice and video clips and organize them into your continuity record.</p></Link>
      </div>
      <div className="mt-8 max-w-3xl"><ClipRecorder /></div>
    </main>
  );
}
