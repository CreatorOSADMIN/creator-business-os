import type { ReactNode } from "react";

/** Small bracketed uppercase label used to introduce each section. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-ui text-xs uppercase tracking-[0.2em] text-text-faint">
      <span className="text-accent">[</span> {children} <span className="text-accent">]</span>
    </span>
  );
}
