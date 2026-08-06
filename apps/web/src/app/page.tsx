export default function Home() {
  const modules = [
    { name: 'Business Brain', status: 'Foundation Ready' },
    { name: 'Executive Advisor', status: 'Foundation Ready' },
    { name: 'Production Assistant', status: 'Foundation Ready' },
    { name: 'Continuity Vault', status: 'Foundation Ready' },
    { name: 'Legacy Score', status: 'Foundation Ready' },
  ];

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">LegacyOS Command Center</h1>
      <p className="mt-4">Order in Your Absence. Business continuity powered by AI.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <div key={module.name} className="rounded-lg border p-5">
            <h2 className="text-xl font-semibold">{module.name}</h2>
            <p className="mt-2">{module.status}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
