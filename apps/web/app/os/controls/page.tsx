import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../lib/supabase/server";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";
import LegacyOsControls from "../controls";

export const dynamic = "force-dynamic";

export default async function LegacyOsControlsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/auth/login");

  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/auth/login");

  const continuity = await getContinuityEngineState();
  const workspaceId = continuity.workspaceId;
  let devices: Array<{ id: string; name: string; platform: string; status: string }> = [];
  let sources: Array<{ id: string; name: string; source_type: string; provider: string | null; status: string }> = [];

  if (workspaceId) {
    const [{ data: deviceRows, error: deviceError }, { data: sourceRows, error: sourceError }] = await Promise.all([
      supabase.from("legacy_os_devices").select("id,name,platform,status").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("legacy_os_storage_sources").select("id,name,source_type,provider,status").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    ]);
    if (deviceError || sourceError) throw new Error("Unable to load Legacy OS controls.");
    devices = deviceRows ?? [];
    sources = sourceRows ?? [];
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Devices & sources</h1>
            <p className="mt-2 text-sm text-white/45">Control which devices and information sources are part of this continuity workspace.</p>
          </div>
          <Link href="/os" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/65">Back to OS</Link>
        </header>
        <LegacyOsControls workspaceId={workspaceId} devices={devices} sources={sources} />
      </div>
    </main>
  );
}
