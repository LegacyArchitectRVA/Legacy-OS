"use client";

import { FormEvent, useEffect, useState } from "react";
import OrientationTour from "../components/OrientationTour";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

type VoiceMode = "elara" | "client" | "elara_direct";

const voiceOptions: Array<{ value: VoiceMode; label: string; description: string }> = [
  {
    value: "elara",
    label: "Always Elara",
    description: "Elara keeps her own voice and speaks as the Legacy OS guide.",
  },
  {
    value: "client",
    label: "Always Client",
    description: "The experience is written directly for the client, using client-facing language.",
  },
  {
    value: "elara_direct",
    label: "Elara, with direct address",
    description: "Elara remains the default voice, but switches to direct client-facing language when specifically addressing the client by name.",
  },
];

function isVoiceMode(value: unknown): value is VoiceMode {
  return value === "elara" || value === "client" || value === "elara_direct";
}

export default function ProfileShell({ onboarding }: { onboarding: boolean }) {
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTour, setShowTour] = useState(onboarding);
  const [elaraEnabled, setElaraEnabled] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("elara_direct");
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [voicePromptMode, setVoicePromptMode] = useState<VoiceMode>("elara_direct");
  const [savingVoice, setSavingVoice] = useState(false);

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
      setElaraEnabled(data.user.user_metadata?.elara_enabled === true);
      const storedVoiceMode = data.user.user_metadata?.elara_voice_mode;
      if (isVoiceMode(storedVoiceMode)) {
        setVoiceMode(storedVoiceMode);
      }
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

  async function enableElara() {
    if (elaraEnabled) return;
    setVoicePromptMode(voiceMode);
    setShowVoicePrompt(true);
  }

  async function disableElara() {
    setSavingVoice(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: { elara_enabled: false },
    });
    if (!error) setElaraEnabled(false);
    setSavingVoice(false);
  }

  async function confirmVoicePreference() {
    setSavingVoice(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        elara_enabled: true,
        elara_voice_mode: voicePromptMode,
        elara_voice_configured: true,
      },
    });
    if (!error) {
      setVoiceMode(voicePromptMode);
      setElaraEnabled(true);
      setShowVoicePrompt(false);
    }
    setSavingVoice(false);
  }

  async function changeVoiceMode(nextMode: VoiceMode) {
    setVoiceMode(nextMode);
    setSaved(false);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        elara_voice_mode: nextMode,
        elara_voice_configured: true,
      },
    });
    if (!error) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Voice</p>
                    <h2 className="mt-2 text-xl font-semibold">Elara conversation style</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Choose who the Legacy OS sounds like when it communicates. You can change this any time.</p>
                  </div>
                  <button
                    type="button"
                    onClick={elaraEnabled ? disableElara : enableElara}
                    disabled={savingVoice}
                    aria-pressed={elaraEnabled}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${elaraEnabled ? "bg-[#b98a25] text-black" : "border border-white/15 text-white/70"}`}
                  >
                    {elaraEnabled ? "Elara enabled" : "Enable Elara"}
                  </button>
                </div>

                {elaraEnabled && (
                  <fieldset className="mt-6 space-y-3">
                    <legend className="mb-3 text-sm font-medium text-white/75">Conversation voice</legend>
                    {voiceOptions.map((option) => (
                      <label key={option.value} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-black/20 p-4 hover:border-[#e7b84b]/30">
                        <input
                          type="radio"
                          name="elara-voice-mode"
                          value={option.value}
                          checked={voiceMode === option.value}
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
                )}
              </section>
            </div>

            <aside className="rounded-2xl border border-[#e7b84b]/25 bg-[#100d07] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Your guide</p>
              <h2 className="mt-2 font-serif text-2xl">Elara</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Your default guide through the Legacy OS, from your first profile setup to the seven pillars and everything connected to them.</p>
              <button onClick={() => setShowTour(true)} className="mt-5 w-full rounded-lg border border-[#e7b84b]/30 px-4 py-3 text-sm text-[#f0c85a]">Start orientation again</button>
            </aside>
          </div>
        </div>
      </main>

      {showVoicePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="voice-prompt-title">
          <div className="w-full max-w-xl rounded-2xl border border-[#e7b84b]/30 bg-[#100d07] p-6 shadow-2xl sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Elara is ready</p>
            <h2 id="voice-prompt-title" className="mt-2 font-serif text-3xl">How should I speak?</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">Before Elara starts, choose how you want the Legacy OS to address people. You can change this later in Profile settings.</p>

            <div className="mt-6 space-y-3">
              {voiceOptions.map((option) => (
                <label key={option.value} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${voicePromptMode === option.value ? "border-[#e7b84b]/60 bg-[#e7b84b]/10" : "border-white/10 bg-black/20"}`}>
                  <input
                    type="radio"
                    name="elara-voice-prompt-mode"
                    value={option.value}
                    checked={voicePromptMode === option.value}
                    onChange={() => setVoicePromptMode(option.value)}
                    className="mt-1 accent-[#b98a25]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">{option.label}</span>
                    <span className="mt-1 block text-sm leading-5 text-white/45">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowVoicePrompt(false)} className="rounded-lg border border-white/10 px-5 py-3 text-sm text-white/60">Not now</button>
              <button type="button" onClick={() => void confirmVoicePreference()} disabled={savingVoice} className="rounded-lg bg-[#b98a25] px-5 py-3 text-sm font-semibold text-black">{savingVoice ? "Saving…" : "Enable Elara"}</button>
            </div>
          </div>
        </div>
      )}

      {showTour && <OrientationTour onComplete={completeOrientation} />}
    </>
  );
}
