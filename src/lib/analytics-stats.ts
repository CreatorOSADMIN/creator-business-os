export interface GrowthPoint {
  date: string; // YYYY-MM-DD (UTC)
  count: number;
}

function utcDayKey(date: Date): string {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

/**
 * Buckets registration timestamps into daily counts covering the last
 * `days` days (UTC calendar days, inclusive of `now`'s day). Days with no
 * signups are included with a count of 0 so the series has no gaps.
 */
export function computeGrowthSeries(createdAt: Date[], days: number, now: Date = new Date()): GrowthPoint[] {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const buckets = new Map<string, number>();
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    buckets.set(utcDayKey(cursor), 0);
  }

  for (const date of createdAt) {
    const key = utcDayKey(date);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

/** Counts how many of the given timestamps fall on or after `since`. */
export function countSince(createdAt: Date[], since: Date): number {
  return createdAt.filter((date) => date >= since).length;
}

/** Rounds a verified/total ratio to one decimal place as a percentage (0 when total is 0). */
export function conversionRate(verified: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((verified / total) * 1000) / 10;
}
