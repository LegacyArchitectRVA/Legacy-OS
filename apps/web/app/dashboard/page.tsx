import Link from "next/link";

export default function Dashboard() {
  const modules = [
    "Business Brain",
    "Continuity Vault",
    "Executive Advisor",
    "Production Assistant",
    "Legacy Score",
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">LegacyOS Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => <div key={module} className="rounded border p-6">{module}</div>)}
        <Link href="/dashboard/recall" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Legacy Recall</div><p className="mt-2 text-sm text-muted-foreground">Find the memories, evidence, and provenance behind your continuity record.</p></Link>
        <Link href="/dashboard/continuity" className="rounded border p-6 transition hover:bg-muted"><div className="font-semibold">Continuity Readiness</div><p className="mt-2 text-sm text-muted-foreground">See coverage, readiness, and the gaps that could interrupt continuity.</p></Link>
      </div>
    </main>
  );
}
