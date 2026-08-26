"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("email")?.trim().toLowerCase();
    const saved = sessionStorage.getItem("legacyos.signup.email") || "";
    setEmail(fromUrl || saved);
  }, []);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const normalizedEmail = email.trim().toLowerCase();
      const { error: authError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: code.replace(/\D/g, "").slice(0, 8),
        type: "email",
      });
      if (authError) throw authError;
      const name = sessionStorage.getItem("legacyos.signup.name");
      if (name) await supabase.auth.updateUser({ data: { full_name: name } });
      sessionStorage.removeItem("legacyos.signup.email");
      sessionStorage.removeItem("legacyos.signup.name");
      router.replace("/profile?onboarding=1");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "That code wasn't accepted. Check it and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setSent(false);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "We couldn't resend the code.");
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-16 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-[#e7b84b]/25 bg-[#0b0b0b] p-7 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p>
        <h1 className="mt-3 font-serif text-3xl">Enter your code</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">The verification screen is intentionally separate, so the page can't reset you back to account creation.</p>
        <form onSubmit={verify} className="mt-7 space-y-4">
          <label className="block text-sm text-white/70">Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 outline-none focus:border-[#e7b84b]/50" />
          </label>
          <label className="block text-sm text-white/70">Verification code
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" autoFocus required minLength={6} maxLength={8} className="mt-2 w-full rounded-lg border border-[#e7b84b]/30 bg-white/[0.03] px-4 py-4 text-center text-2xl tracking-[0.45em] outline-none focus:border-[#e7b84b]" />
          </label>
          {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
          {sent && <p className="text-sm text-emerald-300">A new code is on its way.</p>}
          <button disabled={busy} className="w-full rounded-lg bg-[#b98a25] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Verifying…" : "Verify and enter Legacy OS"}</button>
        </form>
        <button onClick={resend} className="mt-4 w-full text-sm text-white/45 hover:text-[#f0c85a]">Didn't get it? Send another code</button>
      </div>
    </main>
  );
}
