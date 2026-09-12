"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LegacyOsControls from "../controls";

type Device = { id: string; name: string; platform: string; status: string };
type Source = { id: string; name: string; source_type: string; provider: string | null; status: string };

type State = { workspaceId: string | null };

export default function LegacyOsControlsPage() {
  const [state, setState] = useState<State>({ workspaceId: null });
  const [devices, setDevices] = useState<Device[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const responses = await Promise.all([
        fetch("/api/continuity", { cache: "no-store" }),
        fetch("/api/devices", { cache: "no-store" }),
        fetch("/api/storage-sources", { cache: "no-store" }),
      ]);
      const bodies = await Promise.all(responses.map(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Unable to load controls.");
        return body;
      }));
      setState({ workspaceId: typeof bodies[0].workspaceId === "string" ? bodies[0].workspaceId : null });
      setDevices(Array.isArray(bodies[1].devices) ? bodies[1].devices : []);
      setSources(Array.isArray(bodies[2].sources) ? bodies[2].sources : []);
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to load controls."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Devices & sources</h1><p className="mt-2 text-sm text-white/45">Control which devices and information sources are part of this continuity workspace.</p></div>
          <Link href="/os" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/65">Back to OS</Link>
        </header>
        {loading && <div className="mt-8 rounded-2xl border border-white/10 p-6 text-sm text-white/45">Loading workspace controls…</div>}
        {error && <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-sm" role="alert">{error}</div>}
        {!loading && !error && <LegacyOsControls workspaceId={state.workspaceId} devices={devices} sources={sources} onChanged={() => void load()} />}
      </div>
    </main>
  );
}
