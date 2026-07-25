export default function AdminCreatorsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-32 rounded bg-[var(--border-subtle)]" />
      <div className="mt-4 h-10 w-full rounded-lg bg-[var(--border-subtle)]" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-lg bg-[var(--border-subtle)]" />
        ))}
      </div>
    </div>
  );
}
