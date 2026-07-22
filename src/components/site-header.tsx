import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--foreground)] font-mono-label text-[11px] font-semibold text-white">
            OS
          </span>
          <span className="font-display text-lg font-medium tracking-tight">CreatorOS</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[var(--ink-muted)] sm:flex">
          <Link href="/#problem" className="hover:text-[var(--foreground)]">
            Why CreatorOS
          </Link>
          <Link href="/about" className="hover:text-[var(--foreground)]">
            About
          </Link>
          <Link href="/contact" className="hover:text-[var(--foreground)]">
            Contact
          </Link>
        </nav>
        <Link
          href="/early-access"
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
        >
          Join Early Access
        </Link>
      </div>
    </header>
  );
}
