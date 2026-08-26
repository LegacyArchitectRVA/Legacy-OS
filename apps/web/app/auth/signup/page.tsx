"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const normalizedEmail = email.trim().toLowerCase();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true, data: { full_name: name.trim() || undefined } },
      });
      if (authError) throw authError;
      sessionStorage.setItem("legacyos.signup.email", normalizedEmail);
      if (name.trim()) sessionStorage.setItem("legacyos.signup.name", name.trim());
      router.push(`/auth/verify?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "We couldn't send the verification code.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#050505] px-5 py-16 text-white"><div className="mx-auto max-w-md rounded-2xl border border-[#e7b84b]/25 bg-[#0b0b0b] p-7 shadow-2xl"><p className="text-xs uppercase tracking-[0.3em] text-[#e7b84b]">Legacy OS</p><h1 className="mt-3 font-serif text-3xl">Create your account</h1><p className="mt-2 text-sm leading-6 text-white/50">We'll email you a one-time verification code, then take you directly into your profile.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm text-white/70">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 outline-none focus:border-[#e7b84b]/50" autoComplete="name" /></label><label className="block text-sm text-white/70">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 outline-none focus:border-[#e7b84b]/50" autoComplete="email" /></label>{error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-[#b98a25] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Sending code…" : "Send verification code"}</button></form></div></main>;
}
