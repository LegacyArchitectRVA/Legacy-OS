"use client";

import { FormEvent, useEffect, useState } from "react";
import OrientationTour from "../components/OrientationTour";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import { isLegacyOsVoiceMode, type LegacyOsVoiceMode } from "../../lib/legacyos-voice";

const voiceOptions: Array<{ value: LegacyOsVoiceMode; label: string; description: string }> = [
  {
    value: "elara_direct",
    label: "Elara, by name",
    description: "Elara speaks by default, and switches to addressing you directly by name when it matters.",
  },
  {
    value: "elara",
    label: "Always Elara",
    description: "Elara keeps her own voice throughout, distinct from yours.",
  },
  {
    value: "client",
    label: "Speak to me directly",
    description: "Skip the persona. The assistant talks to you in plain second-person language.",
  },
];

export default function ProfileShell({ onboarding }: { onboarding: boolean }) {
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTour, setShowTour] = useState(onboarding);
  const [voiceMode, setVoiceMode] = useState<LegacyOsVoiceMode>("elara_direct");
  const [savingVoice, setSavingVoice] = useState(false);
  const [voiceSaved, setVoiceSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        window.location.replace("/auth/signup");
        return;
      }
      setUserEmail(data.user.email ?? "");
      setName((data.user.user_metadata?.full_name as string | undefined) ?? "");
      const storedVoiceMode = data.user.user_metadata?.elara_voice_mode;
      if (isLegacyOsVoiceMode(storedVoiceMode)) setVoiceMode(storedVoiceMode);
      if (sessionStorage.getItem("legacyos.orientation.complete") === "1") {
        setShowTour(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSaving(false);
    setSaved(!error);
  }

  async function changeVoiceMode(nextMode: LegacyOsVoiceMode) {
    setVoiceMode(nextMode);
    setVoiceSaved(false);
    setSavingVoice(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ data: { elara_voice_mode: nextMode } });
    setSavingVoice(false);
    if (!error) {
      setVoiceSaved(true);
      window.setTimeout(() => setVoiceSaved(false), 1800);
    }
  }

  function completeOrientation() {
    setShowTour(false);
    window.history.replaceState({}, "", "/profile");
  }

  return (
    <>
      <main className="min-h-screen bg-[#050505] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="border-b border-white/10 pb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p>
            <h1 className="mt-2 font-serif text-4xl">Your Profile</h1>
            <p className="mt-2 text-sm text-white/45">This is your personal starting point. Everything else in the OS grows from here.</p>
          </header>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="text-xl font-semibold">Identity</h2>
                <label className="mt-6 block text-sm text-white/60">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#e7b84b]/50" autoComplete="name" /></label>
                <label className="mt-4 block text-sm text-white/60">Email<input value={userEmail} readOnly className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white/45" /></label>
                <button disabled={saving} className="mt-6 rounded-lg bg-[#b98a25] px-5 py-3 font-semibold text-black">{saving ? "Saving…" : "Save profile"}</button>
                {saved && <span className="ml-3 text-sm text-emerald-300">Saved</span>}
              </form>

              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Voice</p>
                <h2 className="mt-2 text-xl font-semibold">How Legacy OS talks to you</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Choose how the assistant addresses you when you ask it something. You can change this any time.</p>
                <fieldset className="mt-6 space-y-3">
                  <legend className="sr-only">Conversation voice</legend>
                  {voiceOptions.map((option) => (
                    <label key={option.value} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-black/20 p-4 hover:border-[#e7b84b]/30">
                      <input
                        type="radio"
                        name="voice-mode"
                        value={option.value}
                        checked={voiceMode === option.value}
                        disabled={savingVoice}
                        onChange={() => void changeVoiceMode(option.value)}
                        className="mt-1 accent-[#b98a25]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">{option.label}</span>
                        <span className="mt-1 block text-sm leading-5 text-white/45">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                {voiceSaved && <p className="mt-3 text-sm text-emerald-300">Saved</p>}
              </section>
            </div>

            <aside className="rounded-2xl border border-[#e7b84b]/25 bg-[#100d07] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Orientation</p>
              <h2 className="mt-2 font-serif text-2xl">New here?</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Walk back through how the Legacy OS is organized, from your profile to your seven chapters and everything connected to them.</p>
              <button onClick={() => setShowTour(true)} className="mt-5 w-full rounded-lg border border-[#e7b84b]/30 px-4 py-3 text-sm text-[#f0c85a]">Start orientation again</button>
            </aside>
          </div>
        </div>
      </main>

      {showTour && <OrientationTour onComplete={completeOrientation} />}
    </>
  );
}
