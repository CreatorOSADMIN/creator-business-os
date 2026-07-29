import { prisma } from "@/lib/prisma";
import { computeGrowthSeries, countSince, conversionRate } from "@/lib/analytics-stats";
import { GrowthChart } from "@/components/admin/growth-chart";

const GROWTH_WINDOW_DAYS = 30;

export default async function AdminAnalyticsPage() {
  const creators = await prisma.creator.findMany({
    select: { createdAt: true, emailVerifiedAt: true },
  });

  const now = new Date();
  const createdAt = creators.map((c) => c.createdAt);

  const total = creators.length;
  const verified = creators.filter((c) => c.emailVerifiedAt !== null).length;

  const since7 = new Date(now);
  since7.setUTCDate(since7.getUTCDate() - 7);
  const since30 = new Date(now);
  since30.setUTCDate(since30.getUTCDate() - 30);

  const last7Days = countSince(createdAt, since7);
  const last30Days = countSince(createdAt, since30);
  const series = computeGrowthSeries(createdAt, GROWTH_WINDOW_DAYS, now);

  return (
    <div>
      <h1 className="font-display text-2xl tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Investor-ready snapshot of Early Access growth.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total signups" value={total} highlight />
        <KpiCard label="Verified emails" value={verified} />
        <KpiCard label="Conversion rate" value={`${conversionRate(verified, total)}%`} />
        <KpiCard label="Last 7 days" value={last7Days} />
        <KpiCard label="Last 30 days" value={last30Days} />
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border-subtle)] bg-white p-5">
        <h2 className="font-medium">Signups over the last {GROWTH_WINDOW_DAYS} days</h2>
        <div className="mt-4">
          <GrowthChart data={series} />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
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
