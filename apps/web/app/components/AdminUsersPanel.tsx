"use client";

import { FormEvent, useState } from "react";

export default function AdminUsersPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, sendInvite: true }),
      });
      const data = await response.json();
      setMessage(response.ok ? `Account created for ${data.user.email}. Temporary password issued.` : data.error ?? "Unable to create account.");
      if (response.ok) { setEmail(""); setPassword(""); }
    } catch {
      setMessage("Unable to reach the account service.");
    } finally { setBusy(false); }
  }

  return (
    <section aria-labelledby="admin-users-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Administration</p>
      <h2 id="admin-users-heading" className="mt-1 text-xl font-semibold">Create a Legacy OS User</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">Create trial accounts yourself. New users don't receive unrestricted public signup access.</p>
      <form onSubmit={createUser} className="mt-5 grid gap-3">
        <label className="grid gap-1 text-sm text-white/60">Email<input className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-300/50" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="grid gap-1 text-sm text-white/60">Temporary password<input className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-300/50" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} required /></label>
        <button disabled={busy} className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50" type="submit">{busy ? "Creating…" : "Create account"}</button>
      </form>
      {message && <p className="mt-4 text-sm text-white/60" role="status">{message}</p>}
    </section>
  );
}
