"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "legacyos:accessibility:colorblind-mode";
const PROFILE_KEY = "legacyos:accessibility:colorblind-profile";
type ColorblindProfile = "general" | "protanopia" | "deuteranopia" | "tritanopia";

function getSnapshot() {
  return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(callback: () => void) {
  window.addEventListener("legacyos:accessibility-change", callback);
  return () => window.removeEventListener("legacyos:accessibility-change", callback);
}

function getProfileSnapshot(): ColorblindProfile {
  if (typeof window === "undefined") return "general";
  const value = window.localStorage.getItem(PROFILE_KEY);
  return value === "protanopia" || value === "deuteranopia" || value === "tritanopia" ? value : "general";
}

function subscribeProfile(callback: () => void) {
  window.addEventListener("legacyos:accessibility-change", callback);
  return () => window.removeEventListener("legacyos:accessibility-change", callback);
}

export default function AccessibilitySettings() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => "general" as ColorblindProfile);

  useEffect(() => {
    document.documentElement.dataset.colorblind = enabled ? "true" : "false";
    document.documentElement.dataset.colorblindProfile = enabled ? profile : "none";
  }, [enabled, profile]);

  function notify() {
    window.dispatchEvent(new Event("legacyos:accessibility-change"));
  }

  function toggle() {
    window.localStorage.setItem(STORAGE_KEY, String(!enabled));
    notify();
  }

  function changeProfile(next: ColorblindProfile) {
    window.localStorage.setItem(PROFILE_KEY, next);
    notify();
  }

  return (
    <section aria-labelledby="accessibility-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Settings</p>
          <h2 id="accessibility-heading" className="mt-1 text-lg font-semibold text-white">Accessibility</h2>
          <p className="mt-1 text-sm text-white/50">Adjust visual presentation without changing saved legacy information.</p>
        </div>
        <button type="button" role="switch" aria-checked={enabled} aria-label="Enable colorblind mode" onClick={toggle} className={`relative h-7 w-12 shrink-0 rounded-full border transition ${enabled ? "border-cyan-300/60 bg-cyan-300/30" : "border-white/15 bg-white/10"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Colorblind mode</p>
            <p className="mt-1 text-xs text-white/40">Uses color-safe contrast plus shape, text, and status cues so color isn't the only signal.</p>
          </div>
          <span className="text-xs font-medium text-white/50">{enabled ? "On" : "Off"}</span>
        </div>

        <label className="mt-4 block">
          <span className="text-xs text-white/40">Color vision profile</span>
          <select value={profile} disabled={!enabled} onChange={(event) => changeProfile(event.target.value as ColorblindProfile)} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">
            <option value="general">General color-safe mode</option>
            <option value="protanopia">Protanopia / red-weak</option>
            <option value="deuteranopia">Deuteranopia / green-weak</option>
            <option value="tritanopia">Tritanopia / blue-weak</option>
          </select>
        </label>
      </div>

      <style jsx global>{`
        :root[data-colorblind="true"] { --cb-accent: #0072b2; --cb-success: #009e73; --cb-warning: #e69f00; --cb-danger: #d55e00; }
        :root[data-colorblind="true"] [class*="text-red-"] { color: var(--cb-danger) !important; }
        :root[data-colorblind="true"] [class*="text-green-"] { color: var(--cb-success) !important; }
        :root[data-colorblind="true"] [class*="text-yellow-"] { color: var(--cb-warning) !important; }
        :root[data-colorblind="true"] [class*="text-amber-"] { color: var(--cb-warning) !important; }
        :root[data-colorblind="true"] [class*="text-violet-"] { color: var(--cb-accent) !important; }
        :root[data-colorblind="true"] [class*="text-cyan-"] { color: var(--cb-accent) !important; }
        :root[data-colorblind="true"] [class*="bg-red-"] { background-color: color-mix(in srgb, var(--cb-danger) 18%, transparent) !important; }
        :root[data-colorblind="true"] [class*="bg-green-"] { background-color: color-mix(in srgb, var(--cb-success) 18%, transparent) !important; }
        :root[data-colorblind="true"] [class*="bg-yellow-"] { background-color: color-mix(in srgb, var(--cb-warning) 18%, transparent) !important; }
        :root[data-colorblind="true"] [class*="bg-amber-"] { background-color: color-mix(in srgb, var(--cb-warning) 18%, transparent) !important; }
      `}</style>
    </section>
  );
}
