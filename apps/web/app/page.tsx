import HolographicRecallViewer from "./components/HolographicRecallViewer";
import VisualRecallPanel from "./components/VisualRecallPanel";

export default function Home() {
  const modules = [
    "Business Brain",
    "Executive Advisor",
    "Production Assistant",
    "Continuity Vault",
    "Legacy Score",
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">LegacyOS Command Center</h1>
        <p className="mt-4 text-white/60">Order in Your Absence.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((module) => (
            <div key={module} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              {module}
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <VisualRecallPanel />
          <HolographicRecallViewer mediaKind="scene" />
        </div>
      </div>
    </main>
  );
}
