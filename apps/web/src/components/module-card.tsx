type ModuleCardProps = {
  title: string;
  description: string;
  status?: string;
};

export function ModuleCard({ title, description, status = 'Ready' }: ModuleCardProps) {
  return (
    <section className="rounded-xl border p-6">
      <h2 className="text-xl font-serif">{title}</h2>
      <p>{description}</p>
      <span>{status}</span>
    </section>
  );
}
