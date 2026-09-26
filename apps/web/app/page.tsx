import Link from "next/link";
import AccessibilitySettings from "./components/AccessibilitySettings";
import EvidenceVault from "./components/EvidenceVault";
import LegacyContextSelector from "./components/LegacyContextSelector";

const modules = [
  { name: "Continuity Readiness", description: "See your seven pillars at a glance and know exactly what's covered, in progress, or still open." },
  { name: "Legacy Recall", description: "Preserve stories, memories, and relationships with the evidence and provenance attached, not just the memory itself." },
  { name: "Successor Mode", description: "Turn your continuity record into a clear set of actions, gaps, and evidence someone else can actually act on." },
  { name: "Clip Library", description: "Keep private voice and video clips organized alongside the rest of your record." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Legacy OS</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Order in your absence.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">Legacy OS is where your Life Manual actually lives. It helps you get what's in your head and your file cabinet into a record someone else can pick up and run with, whether that's a spouse, a kid, or whoever's stuck holding the keys.</p>
        </header>

        <section className="mt-8"><LegacyContextSelector /></section>

        <section aria-labelledby="modules-heading" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Continuity system</p>
              <h2 id="modules-heading" className="mt-1 text-2xl font-semibold">What Legacy OS actually does</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">Foundation</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <article key={module.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-semibold text-white">{module.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{module.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="recall-heading" className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Get started</p>
            <h2 id="recall-heading" className="mt-1 text-2xl font-semibold">Add your first piece of evidence</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">A memory, a document, a photo, whatever you've got. Attach the source and Legacy Recall keeps track of what's confirmed versus what's still a guess.</p>
          </div>
          <EvidenceVault context="personal" />
        </section>

        <section className="mt-8"><AccessibilitySettings /></section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-white/60">Already have an account?</p>
          <Link href="/auth" className="mt-3 inline-block rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950">Sign in to your workspace</Link>
        </section>
      </div>
    </main>
  );
}
