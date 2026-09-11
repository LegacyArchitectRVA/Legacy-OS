"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type ClipKind = "audio" | "video";
type PillarKey =
  | "digital_life"
  | "financial_assets"
  | "household_property"
  | "health_medical"
  | "vital_records"
  | "business_continuity"
  | "legacy_wishes";

type Clip = {
  id: string;
  title: string;
  kind: ClipKind;
  storage_path: string | null;
  duration_seconds: number | null;
  pillar_key: PillarKey | null;
  life_manual_section: string | null;
  successor_action_id: string | null;
  created_at: string;
};

type SuccessorAction = {
  id: string;
  title: string;
  state: "open" | "in_progress" | "blocked" | "complete";
};

type ClipTable = {
  select: (columns: string) => {
    order: (column: string, options: { ascending: boolean }) => {
      then: (resolve: (result: { data: Clip[] | null; error: Error | null }) => void) => void;
    };
  };
  update: (values: Partial<Clip>) => {
    eq: (column: string, value: string) => PromiseLike<{ error: Error | null }>;
  };
  delete: () => {
    eq: (column: string, value: string) => PromiseLike<{ error: Error | null }>;
  };
};

const PILLARS: Array<{ key: PillarKey; label: string }> = [
  { key: "digital_life", label: "Digital Life" },
  { key: "financial_assets", label: "Financial & Assets" },
  { key: "household_property", label: "Household & Property" },
  { key: "health_medical", label: "Health & Medical" },
  { key: "vital_records", label: "Vital Records" },
  { key: "business_continuity", label: "Business Continuity" },
  { key: "legacy_wishes", label: "Legacy & Wishes" },
];

function formatDuration(seconds: number | null) {
  if (seconds === null) return "";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [actions, setActions] = useState<SuccessorAction[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClips = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("You must be signed in to view your clips.");
      setLoading(false);
      return;
    }

    const table = supabase.from("legacy_os_clips") as unknown as ClipTable;
    const result = await new Promise<{ data: Clip[] | null; error: Error | null }>((resolve) => {
      table.select("id,title,kind,storage_path,duration_seconds,pillar_key,life_manual_section,successor_action_id,created_at")
        .order("created_at", { ascending: false })
        .then(resolve);
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setClips(result.data ?? []);
    setLoading(false);

    const handoffResponse = await fetch("/api/successor/handoff", { cache: "no-store" });
    if (handoffResponse.ok) {
      const handoff = await handoffResponse.json() as { openActions?: SuccessorAction[]; blockedActions?: SuccessorAction[]; inProgressActions?: SuccessorAction[]; completedActions?: SuccessorAction[] };
      const availableActions = [
        ...(handoff.openActions ?? []),
        ...(handoff.inProgressActions ?? []),
        ...(handoff.blockedActions ?? []),
        ...(handoff.completedActions ?? []),
      ];
      setActions(availableActions);
    }

    const signedEntries = await Promise.all((result.data ?? []).map(async (clip) => {
      if (!clip.storage_path) return null;
      const { data, error: signedError } = await supabase.storage
        .from("legacy-os-clips")
        .createSignedUrl(clip.storage_path, 60 * 15);
      return signedError || !data?.signedUrl ? null : [clip.id, data.signedUrl] as const;
    }));
    setUrls(Object.fromEntries(signedEntries.filter((entry): entry is readonly [string, string] => entry !== null)));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadClips();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateClip = async (clip: Clip, values: Partial<Clip>) => {
    setSavingId(clip.id);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const table = supabase.from("legacy_os_clips") as unknown as ClipTable;
    const { error: updateError } = await table.update(values).eq("id", clip.id);
    if (updateError) setError(updateError.message);
    else setClips((current) => current.map((item) => item.id === clip.id ? { ...item, ...values } : item));
    setSavingId(null);
  };

  const deleteClip = async (clip: Clip) => {
    if (!window.confirm(`Delete “${clip.title}”? This permanently removes the saved clip.`)) return;
    setSavingId(clip.id);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const table = supabase.from("legacy_os_clips") as unknown as ClipTable;
    const { error: deleteError } = await table.delete().eq("id", clip.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      if (clip.storage_path) await supabase.storage.from("legacy-os-clips").remove([clip.storage_path]);
      setClips((current) => current.filter((item) => item.id !== clip.id));
      setUrls((current) => {
        const next = { ...current };
        delete next[clip.id];
        return next;
      });
    }
    setSavingId(null);
  };

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">← Dashboard</Link>
            <h1 className="mt-3 text-3xl font-bold">Clip Library</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Saved voice and video clips stay private to your account. Access links expire automatically, and each clip can be organized into the continuity record.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Record another clip</Link>
        </div>

        {error && <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{error}</p>}

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your clips…</p>
        ) : clips.length === 0 ? (
          <section className="mt-8 rounded-xl border p-8 text-center">
            <h2 className="text-lg font-semibold">No saved clips yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Record a voice or video clip from the dashboard, then save it to Legacy OS.</p>
          </section>
        ) : (
          <div className="mt-8 space-y-5">
            {clips.map((clip) => (
              <article key={clip.id} className="rounded-xl border p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <input
                      aria-label="Clip title"
                      value={clip.title}
                      disabled={savingId === clip.id}
                      onChange={(event) => setClips((current) => current.map((item) => item.id === clip.id ? { ...item, title: event.target.value } : item))}
                      onBlur={() => void updateClip(clip, { title: clip.title.trim() || "Untitled clip" })}
                      className="w-full rounded-md border bg-background px-3 py-2 text-lg font-semibold"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">{clip.kind === "video" ? "Video" : "Voice"} · {formatDuration(clip.duration_seconds)} · {formatDate(clip.created_at)}</p>
                  </div>
                  <button type="button" disabled={savingId === clip.id} onClick={() => void deleteClip(clip)} className="rounded-lg border px-3 py-2 text-sm text-destructive hover:bg-destructive/5">Delete</button>
                </div>

                {urls[clip.id] ? (
                  <div className="mt-4 rounded-lg border p-3">
                    {clip.kind === "video" ? <video src={urls[clip.id]} controls className="max-h-96 w-full rounded-md" /> : <audio src={urls[clip.id]} controls className="w-full" />}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Secure playback link unavailable. Refresh to request a new one.</p>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Continuity pillar</span>
                    <select
                      value={clip.pillar_key ?? ""}
                      disabled={savingId === clip.id}
                      onChange={(event) => void updateClip(clip, { pillar_key: (event.target.value || null) as PillarKey | null })}
                      className="w-full rounded-md border bg-background px-3 py-2"
                    >
                      <option value="">Unassigned</option>
                      {PILLARS.map((pillar) => <option key={pillar.key} value={pillar.key}>{pillar.label}</option>)}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Successor action</span>
                    <select
                      value={clip.successor_action_id ?? ""}
                      disabled={savingId === clip.id}
                      onChange={(event) => void updateClip(clip, { successor_action_id: event.target.value || null })}
                      className="w-full rounded-md border bg-background px-3 py-2"
                    >
                      <option value="">No action linked</option>
                      {actions.map((action) => <option key={action.id} value={action.id}>{action.title} · {action.state.replace("_", " ")}</option>)}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Life Manual section</span>
                    <input
                      value={clip.life_manual_section ?? ""}
                      disabled={savingId === clip.id}
                      placeholder="e.g. Family instructions"
                      onChange={(event) => setClips((current) => current.map((item) => item.id === clip.id ? { ...item, life_manual_section: event.target.value } : item))}
                      onBlur={() => void updateClip(clip, { life_manual_section: clip.life_manual_section?.trim() || null })}
                      className="w-full rounded-md border bg-background px-3 py-2"
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
