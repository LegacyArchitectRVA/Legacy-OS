"use client";

import { FormEvent, useEffect, useState } from "react";
import OrientationTour from "../components/OrientationTour";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.replace("/auth/signup");
        return;
      }

      setUserEmail(data.user.email ?? "");
      setName((data.user.user_metadata?.full_name as string | undefined) ?? "");

      const onboarding = new URLSearchParams(window.location.search).get("onboarding") === "1";
      const complete = sessionStorage.getItem("legacyos.orientation.complete") === "1";
      setShowTour(onboarding && !complete);
    };

    void load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    setSaving(false);
    setSaved(!error);
  }

  function completeOrientation() {
    setShowTour(false);
    window.history.replaceState({}, "", "/profile");
  }

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p>
          <h1 className="mt-2 font-serif text-4xl">Your Profile</h1>
          <p className="mt-2 text-sm text-white/45">This is your personal starting point. Everything else in the OS grows from here.</p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-xl font-semibold">Identity</h2>
            <label className="mt-6 block text-sm text-white/60">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#e7b84b]/50" autoComplete="name" />
            </label>
            <label className="mt-4 block text-sm text-white/60">
              Email
              <input value={userEmail} readOnly className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white/45" />
            </label>
            <button disabled={saving} className="mt-6 rounded-lg bg-[#b98a25] px-5 py-3 font-semibold text-black">{saving ? "Saving…" : "Save profile"}</button>
            {saved && <span className="ml-3 text-sm text-emerald-300">Saved</span>}
          </form>

          <aside className="rounded-2xl border border-[#e7b84b]/25 bg-[#100d07] p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Your guide</p>
            <h2 className="mt-2 font-serif text-2xl">Elara</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">Your default guide through the Legacy OS, from your first profile setup to the seven pillars and everything connected to them.</p>
            <button onClick={() => setShowTour(true)} className="mt-5 w-full rounded-lg border border-[#e7b84b]/30 px-4 py-3 text-sm text-[#f0c85a]">Start orientation again</button>
          </aside>
        </div>
      </div>

      {showTour && <OrientationTour onComplete={completeOrientation} />}
    </main>
  );
}
