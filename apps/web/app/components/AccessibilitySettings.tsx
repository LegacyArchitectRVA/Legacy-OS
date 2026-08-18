"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "legacyos:accessibility:colorblind-mode";

function getSnapshot() {
  return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function AccessibilitySettings() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    document.documentElement.dataset.colorblind = enabled ? "true" : "false";
  }, [enabled]);

  function toggle() {
    const next = !enabled;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: String(next) }));
  }

  return (
    <section aria-labelledby="accessibility-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Settings</p>
          <h2 id="accessibility-heading" className="mt-1 text-lg font-semibold text-white">Accessibility</h2>
          <p className="mt-1 text-sm text-white/50">Adjust visual presentation without changing your saved legacy information.</p>
        </div>
        <button type="button" role="switch" aria-checked={enabled} aria-label="Enable colorblind mode" onClick={toggle} className={`relative h-7 w-12 shrink-0 rounded-full border transition ${enabled ? "border-cyan-300/60 bg-cyan-300/30" : "border-white/15 bg-white/10"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Colorblind mode</p>
          <p className="mt-1 text-xs text-white/40">Uses a colorblind-friendly palette and adds stronger non-color visual cues.</p>
        </div>
        <span className="text-xs font-medium text-white/50">{enabled ? "On" : "Off"}</span>
      </div>
      <style jsx global>{`
        :root[data-colorblind="true"] { --cb-accent: #00b8d9; --cb-success: #007a5e; --cb-warning: #f2a900; --cb-danger: #d55e00; }
        :root[data-colorblind="true"] [class*="text-red-"] { color: var(--cb-danger) !important; }
        :root[data-colorblind="true"] [class*="text-green-"] { color: var(--cb-success) !important; }
        :root[data-colorblind="true"] [class*="text-yellow-"] { color: var(--cb-warning) !important; }
        :root[data-colorblind="true"] [class*="text-amber-"] { color: var(--cb-warning) !important; }
        :root[data-colorblind="true"] [class*="text-violet-"] { color: var(--cb-accent) !important; }
        :root[data-colorblind="true"] [class*="text-cyan-"] { color: var(--cb-accent) !important; }
      `}</style>
    </section>
  );
}
