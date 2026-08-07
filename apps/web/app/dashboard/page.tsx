export default function Dashboard() {
  const modules = [
    'Business Brain',
    'Continuity Vault',
    'Executive Advisor',
    'Production Assistant',
    'Legacy Score'
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">LegacyOS Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <div key={module} className="rounded border p-6">
            {module}
          </div>
        ))}
      </div>
    </main>
  );
}
