/**
 * Continuous scrolling strip of short labels — an editorial-agency motif for
 * signalling scope/coverage without another content block. Duplicates the
 * list once so the loop is seamless, and is purely decorative (aria-hidden)
 * since the same information is already announced in the paragraph above it.
 */
export function Marquee({ items }: { items: string[] }) {
  const track = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-border" aria-hidden>
      <div className="animate-marquee flex w-max items-center gap-16 py-6">
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-2xl font-bold uppercase tracking-tight text-text-faint sm:text-3xl"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
