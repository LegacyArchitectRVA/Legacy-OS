"use client";

import { useEffect, useSyncExternalStore } from "react";

const COLORBLIND_KEY = "legacyos:accessibility:colorblind-mode";
const PROFILE_KEY = "legacyos:accessibility:colorblind-profile";
const MOTION_KEY = "legacyos:accessibility:reduced-motion";
const CONTRAST_KEY = "legacyos:accessibility:high-contrast";
const SCALE_KEY = "legacyos:accessibility:text-scale";

type ColorblindProfile = "general" | "protanopia" | "deuteranopia" | "tritanopia";
type TextScale = "100" | "110" | "125" | "150";

function getBool(key: string) { return typeof window !== "undefined" && window.localStorage.getItem(key) === "true"; }
function getProfile(): ColorblindProfile {
  if (typeof window === "undefined") return "general";
  const value = window.localStorage.getItem(PROFILE_KEY);
  return value === "protanopia" || value === "deuteranopia" || value === "tritanopia" ? value : "general";
}
function getScale(): TextScale {
  if (typeof window === "undefined") return "100";
  const value = window.localStorage.getItem(SCALE_KEY);
  return value === "110" || value === "125" || value === "150" ? value : "100";
}
function subscribe(callback: () => void) {
  window.addEventListener("legacyos:accessibility-change", callback);
  return () => window.removeEventListener("legacyos:accessibility-change", callback);
}

export default function AccessibilitySettings() {
  const colorblind = useSyncExternalStore(subscribe, () => getBool(COLORBLIND_KEY), () => false);
  const reducedMotion = useSyncExternalStore(subscribe, () => getBool(MOTION_KEY), () => false);
  const highContrast = useSyncExternalStore(subscribe, () => getBool(CONTRAST_KEY), () => false);
  const profile = useSyncExternalStore(subscribe, getProfile, () => "general" as ColorblindProfile);
  const textScale = useSyncExternalStore(subscribe, getScale, () => "100" as TextScale);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.colorblind = colorblind ? "true" : "false";
    root.dataset.colorblindProfile = colorblind ? profile : "none";
    root.dataset.reducedMotion = reducedMotion ? "true" : "false";
    root.dataset.highContrast = highContrast ? "true" : "false";
    root.style.setProperty("--legacyos-text-scale", `${Number(textScale) / 100}`);
  }, [colorblind, profile, reducedMotion, highContrast, textScale]);

  function set(key: string, value: boolean | string) {
    window.localStorage.setItem(key, String(value));
    window.dispatchEvent(new Event("legacyos:accessibility-change"));
  }

  return (
    <section aria-labelledby="accessibility-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Settings</p>
      <h2 id="accessibility-heading" className="mt-1 text-lg font-semibold text-white">Accessibility</h2>
      <p className="mt-1 text-sm text-white/50">Adjust the interface without changing saved legacy information.</p>

      <div className="mt-5 space-y-3">
        <Toggle label="Colorblind mode" description="Uses color-safe contrast and non-color cues." checked={colorblind} onChange={(value) => set(COLORBLIND_KEY, value)} />
        <label className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <span className="text-sm font-medium text-white">Color vision profile</span>
          <select aria-label="Color vision profile" value={profile} disabled={!colorblind} onChange={(event) => set(PROFILE_KEY, event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white disabled:opacity-40">
            <option value="general">General color-safe mode</option>
            <option value="protanopia">Protanopia / red-weak</option>
            <option value="deuteranopia">Deuteranopia / green-weak</option>
            <option value="tritanopia">Tritanopia / blue-weak</option>
          </select>
        </label>
        <Toggle label="Reduced motion" description="Respects a calmer interface with minimal animation." checked={reducedMotion} onChange={(value) => set(MOTION_KEY, value)} />
        <Toggle label="High contrast" description="Strengthens text, borders, controls, and focus indicators." checked={highContrast} onChange={(value) => set(CONTRAST_KEY, value)} />
        <label className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <span className="text-sm font-medium text-white">Text size</span>
          <select aria-label="Text size" value={textScale} onChange={(event) => set(SCALE_KEY, event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white">
            <option value="100">100% Default</option><option value="110">110%</option><option value="125">125%</option><option value="150">150%</option>
          </select>
        </label>
      </div>

      <style jsx global>{`
        :root { --legacyos-text-scale: 1; }
        body { font-size: calc(1rem * var(--legacyos-text-scale)); }
        :root[data-reduced-motion="true"] *, :root[data-reduced-motion="true"] *::before, :root[data-reduced-motion="true"] *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
        :root[data-high-contrast="true"] * { text-shadow: none !important; }
        :root[data-high-contrast="true"] button, :root[data-high-contrast="true"] select, :root[data-high-contrast="true"] input, :root[data-high-contrast="true"] textarea { outline-offset: 3px; }
        :root[data-high-contrast="true"] button:focus-visible, :root[data-high-contrast="true"] select:focus-visible, :root[data-high-contrast="true"] input:focus-visible, :root[data-high-contrast="true"] textarea:focus-visible { outline: 3px solid #00b8d9 !important; }
        :root[data-colorblind="true"] { --cb-accent: #0072b2; --cb-success: #009e73; --cb-warning: #e69f00; --cb-danger: #d55e00; }
        :root[data-colorblind="true"][data-colorblind-profile="protanopia"] { --cb-success: #0072b2; --cb-danger: #cc79a7; --cb-warning: #e69f00; }
        :root[data-colorblind="true"][data-colorblind-profile="deuteranopia"] { --cb-success: #0072b2; --cb-danger: #cc79a7; --cb-warning: #e69f00; }
        :root[data-colorblind="true"][data-colorblind-profile="tritanopia"] { --cb-accent: #d55e00; --cb-success: #009e73; --cb-danger: #cc79a7; --cb-warning: #e69f00; }
        :root[data-colorblind="true"] [class*="text-red-"] { color: var(--cb-danger) !important; }
        :root[data-colorblind="true"] [class*="text-green-"] { color: var(--cb-success) !important; }
        :root[data-colorblind="true"] [class*="text-yellow-"], :root[data-colorblind="true"] [class*="text-amber-"] { color: var(--cb-warning) !important; }
        :root[data-colorblind="true"] [class*="text-violet-"], :root[data-colorblind="true"] [class*="text-cyan-"] { color: var(--cb-accent) !important; }
        :root[data-colorblind="true"] [class*="bg-red-"] { background-color: color-mix(in srgb, var(--cb-danger) 18%, transparent) !important; }
        :root[data-colorblind="true"] [class*="bg-green-"] { background-color: color-mix(in srgb, var(--cb-success) 18%, transparent) !important; }
        :root[data-colorblind="true"] [class*="bg-yellow-"], :root[data-colorblind="true"] [class*="bg-amber-"] { background-color: color-mix(in srgb, var(--cb-warning) 18%, transparent) !important; }
      `}</style>
    </section>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3"><div><p className="text-sm font-medium text-white">{label}</p><p className="mt-1 text-xs text-white/40">{description}</p></div><button type="button" role="switch" aria-checked={checked} aria-label={`Enable ${label}`} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full border transition ${checked ? "border-cyan-300/60 bg-cyan-300/30" : "border-white/15 bg-white/10"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} /></button></div>;
}
