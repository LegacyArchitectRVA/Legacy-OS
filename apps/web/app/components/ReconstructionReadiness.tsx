"use client";

import { useMemo } from "react";
import { assessReconstructionReadiness, type PersonReconstructionProfile } from "../lib/person-reconstruction";

export default function ReconstructionReadiness({ profile }: { profile: PersonReconstructionProfile }) {
  const readiness = useMemo(() => assessReconstructionReadiness(profile), [profile]);
  return (
    <section aria-labelledby="reconstruction-readiness-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Person reconstruction</p><h2 id="reconstruction-readiness-heading" className="mt-1 text-xl font-semibold">{profile.displayName}'s Recreation Readiness</h2></div>
        <div className="text-right"><p className="text-3xl font-bold text-cyan-300">{readiness.score}%</p><p className="text-xs text-white/40">evidence readiness</p></div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${readiness.score}%` }} /></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div><p className="text-xs uppercase tracking-[0.18em] text-white/35">Present</p><ul className="mt-2 space-y-1 text-sm text-white/60">{readiness.strengths.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>
        <div><p className="text-xs uppercase tracking-[0.18em] text-white/35">Still needed</p><ul className="mt-2 space-y-1 text-sm text-white/60">{readiness.missing.length ? readiness.missing.map((item) => <li key={item}>○ {item}</li>) : <li>Ready for the current evidence model.</li>}</ul></div>
      </div>
      <p className="mt-5 text-xs leading-5 text-white/35">A readiness score measures preserved evidence and permission. It does not claim that a digital recreation is identical to the real person.</p>
    </section>
  );
}
