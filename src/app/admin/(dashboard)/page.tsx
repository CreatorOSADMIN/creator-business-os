import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CREATOR_STATUSES, STATUS_LABELS, STATUS_COLORS, PLATFORMS, AUDIENCE_SIZES } from "@/lib/constants";
import type { CreatorStatusValue } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const [total, statusGroups, allCreators, recent] = await Promise.all([
    prisma.creator.count(),
    prisma.creator.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.creator.findMany({ select: { platforms: true, audienceSize: true, country: true } }),
    prisma.creator.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const byStatus: Record<string, number> = Object.fromEntries(CREATOR_STATUSES.map((s) => [s, 0]));
  for (const g of statusGroups) byStatus[g.status] = g._count.status;

  const byPlatform: Record<string, number> = {};
  const byAudience: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const creator of allCreators as { platforms: string; audienceSize: string; country: string }[]) {
    let platforms: string[] = [];
    try {
      platforms = JSON.parse(creator.platforms);
    } catch {
      platforms = [];
    }
    for (const p of platforms) byPlatform[p] = (byPlatform[p] || 0) + 1;
    byAudience[creator.audienceSize] = (byAudience[creator.audienceSize] || 0) + 1;
    byCountry[creator.country] = (byCountry[creator.country] || 0) + 1;
  }

  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div>
      <h1 className="font-display text-2xl tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Overview of Early Access registrations.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Creators" value={total} highlight />
        {CREATOR_STATUSES.map((status) => (
          <KpiCard key={status} label={STATUS_LABELS[status as CreatorStatusValue]} value={byStatus[status]} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent registrations">
          <div className="divide-y divide-[var(--border-subtle)]">
            {recent.length === 0 && (
              <p className="py-6 text-sm text-[var(--ink-muted)]">No creators yet.</p>
            )}
            {recent.map((creator) => (
              <Link
                key={creator.id}
                href={`/admin/creators/${creator.id}`}
                className="flex items-center justify-between py-3 text-sm hover:text-[var(--accent)]"
              >
                <div>
                  <p className="font-medium">{creator.fullName}</p>
                  <p className="text-xs text-[var(--ink-muted)]">{creator.email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[creator.status as CreatorStatusValue] ?? "bg-neutral-100"}`}
                >
                  {STATUS_LABELS[creator.status as CreatorStatusValue] ?? creator.status}
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="By platform">
            <DistributionList
              data={PLATFORMS.map((p) => ({ label: p.label, value: byPlatform[p.value] || 0 }))}
              total={total}
            />
          </Panel>
          <Panel title="By audience size">
            <DistributionList
              data={AUDIENCE_SIZES.map((a) => ({ label: a.label, value: byAudience[a.value] || 0 }))}
              total={total}
            />
          </Panel>
          <Panel title="Top countries">
            <DistributionList
              data={topCountries.map(([label, value]) => ({ label, value }))}
              total={total}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] p-4 ${
        highlight ? "bg-[var(--surface-dark)] text-white" : "bg-white"
      }`}
    >
      <p className={`font-mono-label text-[11px] uppercase ${highlight ? "text-white/60" : "text-[var(--ink-muted)]"}`}>
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-5">
      <h2 className="font-medium">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DistributionList({ data, total }: { data: { label: string; value: number }[]; total: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--ink-muted)]">{d.label}</span>
            <span className="font-medium">
              {d.value} {total > 0 && <span className="text-[var(--ink-muted)]">({Math.round((d.value / total) * 100)}%)</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
