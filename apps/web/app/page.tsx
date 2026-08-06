export default function Home() {
  const modules = [
    'Business Brain',
    'Executive Advisor',
    'Production Assistant',
    'Continuity Vault',
    'Legacy Score'
  ];

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">LegacyOS Command Center</h1>
      <p className="mt-4">Order in Your Absence.</p>
      <section className="grid gap-4 mt-8">
        {modules.map((module) => (
          <div key={module} className="rounded border p-4">
            {module}
          </div>
        ))}
      </section>
    </main>
  );
}
