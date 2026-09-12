"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Pillar = { pillar_key: string; name: string; coverage_score: number; status: "needs_attention" | "in_progress" | "ready" };
type State = { pillars: Pillar[]; readiness: { overall_score: number; ready_count: number } | null; snapshot: { totalMemories: number; gaps: Array<{ title: string; reason: string; severity: string }> } | null };
type Device = { id: string; name: string; platform: string; status: string; last_seen_at: string | null };
type Source = { id: string; name: string; source_type: string; provider: string | null; status: string; last_sync_at: string | null };

const PILLARS = [
  ["digital_life", "Digital Life"], ["financial_assets", "Financial & Assets"], ["household_property", "Household & Property"],
  ["health_medical", "Health & Medical"], ["vital_records", "Vital Records"], ["business_continuity", "Business Continuity"], ["legacy_wishes", "Legacy & Wishes"],
] as const;

const links = [["/os", "Overview"], ["/dashboard/continuity", "Continuity"], ["/dashboard/recall", "Recall"], ["/dashboard/successor", "Successor"], ["/profile", "Profile"]];

function label(value: string) { return value.replaceAll("_", " "); }
function date(value: string | null) { if (!value) return "Never"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "Unknown" : d.toLocaleDateString(); }

export default function LegacyOsPage() {
  const [state, setState] = useState<State | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const responses = await Promise.all([
          fetch("/api/continuity", { cache: "no-store" }),
          fetch("/api/devices", { cache: "no-store" }),
          fetch("/api/storage-sources", { cache: "no-store" }),
        ]);
        const data = await Promise.all(responses.map(async (r) => {
          const body = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(typeof body.error === "string" ? body.error : "Unable to load Legacy OS.");
          return body;
        }));
        if (!mounted) return;
        setState(data[0]); setDevices(Array.isArray(data[1].devices) ? data[1].devices : []); setSources(Array.isArray(data[2].sources) ? data[2].sources : []);
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : "Unable to load Legacy OS."); }
      finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  const pillars = useMemo(() => {
    const byKey = new Map((state?.pillars ?? []).map((p) => [p.pillar_key, p]));
    return PILLARS.map(([key, name]) => byKey.get(key) ?? { pillar_key: key, name, coverage_score: 0, status: "needs_attention" as const });
  }, [state]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Continuity command center</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">One workspace for what is known, what is missing, what changed, and what needs to happen next.</p></div>
          <div className="flex gap-2"><Link href="/profile" className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70">Profile</Link><Link href="/dashboard/recall" className="rounded-xl bg-[#b98a25] px-4 py-3 text-sm font-semibold text-black">Recall</Link></div>
        </header>

        <nav aria-label="Legacy OS sections" className="mt-5 hidden gap-2 lg:flex">{links.map(([href, text]) => <Link key={href} href={href} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/55 hover:text-white">{text}</Link>)}</nav>

        {error && <section className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5" role="alert"><h2 className="font-semibold">Legacy OS could not load your workspace</h2><p className="mt-2 text-sm text-white/55">{error}</p><Link href="/auth/login" className="mt-4 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm">Sign in again</Link></section>}

        {loading && <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading Legacy OS">{["Readiness", "Memories", "Devices", "Sources"].map((x) => <div key={x} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025] p-5"><span className="text-sm text-white/30">{x}</span></div>)}</section>}

        {!loading && !error && <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Workspace overview">
            <article className="rounded-2xl border border-[#e7b84b]/20 bg-[#100d07] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Readiness</p><p className="mt-3 text-4xl font-semibold">{state?.readiness?.overall_score ?? 0}%</p><p className="mt-2 text-sm text-white/45">{state?.readiness?.ready_count ?? 0} of 7 pillars ready</p></article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><p className="text-xs uppercase tracking-[0.2em] text-white/40">Recall</p><p className="mt-3 text-4xl font-semibold">{state?.snapshot?.totalMemories ?? 0}</p><p className="mt-2 text-sm text-white/45">memories in the current record</p></article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><p className="text-xs uppercase tracking-[0.2em] text-white/40">Trusted devices</p><p className="mt-3 text-4xl font-semibold">{devices.filter((x) => x.status === "active").length}</p><p className="mt-2 text-sm text-white/45">{devices.length} registered total</p></article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><p className="text-xs uppercase tracking-[0.2em] text-white/40">Connected sources</p><p className="mt-3 text-4xl font-semibold">{sources.filter((x) => x.status === "active").length}</p><p className="mt-2 text-sm text-white/45">{sources.length} registered total</p></article>
          </section>

          <section aria-labelledby="pillars" className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">The foundation</p><h2 id="pillars" className="mt-1 text-2xl font-semibold">Seven pillars of continuity</h2></div><Link href="/dashboard/continuity" className="text-sm text-white/50">View details</Link></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{pillars.map((p, i) => <article key={p.pillar_key} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex justify-between gap-3"><span className="text-xs font-semibold tracking-[0.2em] text-[#e7b84b]">0{i + 1}</span><span className="text-xs capitalize text-white/40">{label(p.status)}</span></div><h3 className="mt-4 min-h-12 font-semibold">{p.name}</h3><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10" aria-label={`${p.name} coverage ${p.coverage_score}%`}><div className="h-full rounded-full bg-[#b98a25]" style={{ width: `${p.coverage_score}%` }} /></div><p className="mt-2 text-xs text-white/40">{p.coverage_score}% coverage</p></article>)}</div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><div className="flex justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Evidence</p><h2 className="mt-1 text-xl font-semibold">What needs attention</h2></div><Link href="/dashboard/continuity" className="text-sm text-white/45">Open</Link></div><div className="mt-5 space-y-3">{state?.snapshot?.gaps?.length ? state.snapshot.gaps.slice(0, 4).map((g) => <div key={`${g.title}-${g.reason}`} className="rounded-xl border border-white/10 p-4"><div className="flex justify-between gap-3"><h3 className="text-sm font-semibold">{g.title}</h3><span className="text-xs uppercase text-white/35">{g.severity}</span></div><p className="mt-2 text-sm leading-5 text-white/45">{g.reason}</p></div>) : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/45">No current gaps are reported from the available continuity record.</p>}</div></article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><div className="flex justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Infrastructure</p><h2 className="mt-1 text-xl font-semibold">Devices & sources</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">Protected</span></div><div className="mt-5 space-y-3">
              {devices.length ? devices.slice(0, 3).map((d) => <div key={d.id} className="flex justify-between gap-4 rounded-xl border border-white/10 p-4"><div><h3 className="text-sm font-semibold">{d.name}</h3><p className="mt-1 text-xs capitalize text-white/40">{d.platform} · last seen {date(d.last_seen_at)}</p></div><span className="text-xs capitalize text-white/45">{label(d.status)}</span></div>) : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/45">No trusted devices are registered yet.</p>}
              {sources.length ? sources.slice(0, 3).map((s) => <div key={s.id} className="flex justify-between gap-4 rounded-xl border border-white/10 p-4"><div><h3 className="text-sm font-semibold">{s.name}</h3><p className="mt-1 text-xs text-white/40">{s.provider ?? label(s.source_type)} · last sync {date(s.last_sync_at)}</p></div><span className="text-xs capitalize text-white/45">{label(s.status)}</span></div>) : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/45">No storage sources are registered yet.</p>}
              <p className="pt-2 text-xs leading-5 text-white/35">Local computers will connect through a trusted device agent. A browser cannot scan arbitrary hard drives, and Legacy OS never needs raw provider passwords or private keys.</p>
            </div></article>
          </section>

          <section className="mt-8 rounded-2xl border border-[#e7b84b]/20 bg-[#100d07] p-6 sm:p-8"><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Next actions</p><h2 className="mt-2 font-serif text-3xl">Move from information to action.</h2><div className="mt-6 grid gap-3 sm:grid-cols-3"><Link href="/dashboard/recall" className="rounded-xl border border-white/10 bg-black/20 p-4"><span className="block text-sm font-semibold">Search Recall</span><span className="mt-1 block text-xs leading-5 text-white/40">Find evidence and provenance behind the record.</span></Link><Link href="/dashboard/successor" className="rounded-xl border border-white/10 bg-black/20 p-4"><span className="block text-sm font-semibold">Open Successor Mode</span><span className="mt-1 block text-xs leading-5 text-white/40">See actions, unknowns, and evidence warnings.</span></Link><Link href="/profile" className="rounded-xl border border-white/10 bg-black/20 p-4"><span className="block text-sm font-semibold">Security & profile</span><span className="mt-1 block text-xs leading-5 text-white/40">Manage identity and Elara preferences.</span></Link></div></section>
        </>}
      </div>

      <nav aria-label="Mobile Legacy OS navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070707]/95 px-2 py-2 backdrop-blur lg:hidden"><div className="mx-auto grid max-w-xl grid-cols-5 gap-1">{[["/os", "OS"], ["/dashboard/continuity", "Pillars"], ["/dashboard/recall", "Recall"], ["/dashboard/successor", "Next"], ["/profile", "Profile"]].map(([href, text]) => <Link key={href} href={href} className="min-h-11 rounded-lg px-2 py-3 text-center text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white">{text}</Link>)}</div></nav>
    </main>
  );
}
