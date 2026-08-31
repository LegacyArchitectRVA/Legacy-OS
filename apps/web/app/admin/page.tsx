import AdminUsersPanel from "../components/AdminUsersPanel";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">LegacyOS Admin</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Administration</h1>
        <p className="mt-3 max-w-2xl text-white/50">Manage trial access and provision accounts. This area must remain protected by the server-side admin authorization layer.</p>
        <div className="mt-8"><AdminUsersPanel /></div>
      </div>
    </main>
  );
}
