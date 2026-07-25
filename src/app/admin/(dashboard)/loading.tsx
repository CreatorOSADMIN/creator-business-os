export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 rounded bg-[var(--border-subtle)]" />
      <div className="mt-2 h-4 w-64 rounded bg-[var(--border-subtle)]" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--border-subtle)]" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-[var(--border-subtle)]" />
        <div className="h-64 rounded-xl bg-[var(--border-subtle)]" />
      </div>
    </div>
  );
}
