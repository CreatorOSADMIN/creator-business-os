import type { GrowthPoint } from "@/lib/analytics-stats";

const WIDTH = 700;
const HEIGHT = 160;
const BAR_GAP = 2;

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No data yet.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = WIDTH / data.length - BAR_GAP;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-40 w-full"
      role="img"
      aria-label="Early access signups per day over the selected period"
    >
      {data.map((point, i) => {
        const barHeight = (point.count / max) * (HEIGHT - 20);
        const x = i * (barWidth + BAR_GAP);
        const y = HEIGHT - barHeight;
        return (
          <g key={point.date}>
            <rect
              x={x}
              y={y}
              width={Math.max(barWidth, 1)}
              height={barHeight}
              rx={1.5}
              style={{ fill: "var(--accent)" }}
            >
              <title>{`${point.date}: ${point.count}`}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}
