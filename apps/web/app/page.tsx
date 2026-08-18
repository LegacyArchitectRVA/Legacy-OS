import AccessibilitySettings from "./components/AccessibilitySettings";
import HolographicRecallViewer from "./components/HolographicRecallViewer";
import SignLanguagePanel from "./components/SignLanguagePanel";
import SignVideoVoicePlayer from "./components/SignVideoVoicePlayer";
import VisualRecallPanel from "./components/VisualRecallPanel";
import LegacyContextSelector from "./components/LegacyContextSelector";

const modules = [
  {
    name: "Knowledge Brain",
    description: "Your searchable memory for people, places, documents, decisions, and know-how.",
  },
  {
    name: "Decision Advisor",
    description: "Pressure-test important decisions and surface risks, assumptions, and missing information.",
  },
  {
    name: "Continuity Vault",
    description: "Keep critical information organized for the people who may need it.",
  },
  {
    name: "Legacy Recall",
    description: "Preserve stories, memories, relationships, voice, images, and video with evidence and provenance.",
  },
  {
    name: "Legacy Score",
    description: "See how prepared your life, family, or business is for interruption and transition.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">LegacyOS</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Continuity for life, family, and business.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">
            Preserve what matters, understand what is missing, and make the information people depend on usable when someone important is unavailable.
          </p>
        </header>

        <section className="mt-8">
          <LegacyContextSelector />
        </section>

        <section aria-labelledby="modules-heading" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Continuity system</p>
              <h2 id="modules-heading" className="mt-1 text-2xl font-semibold">Your LegacyOS layers</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">Foundation</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Human memory layer</p>
            <h2 id="recall-heading" className="mt-1 text-2xl font-semibold">Legacy Recall</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
              Recall connects authorized source material into an evidence-grounded memory experience. Reconstruction is always distinguished from original evidence.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <VisualRecallPanel />
            <HolographicRecallViewer mediaKind="scene" />
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <AccessibilitySettings />
          <SignLanguagePanel />
          <SignVideoVoicePlayer videoUri="" />
        </section>
      </div>
    </main>
  );
}
