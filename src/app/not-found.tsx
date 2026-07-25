import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="font-mono-label text-xs uppercase text-[var(--accent)]">404</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">Page not found.</h1>
          <p className="mt-4 text-[var(--ink-muted)]">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
            >
              Back to homepage
            </Link>
            <Link
              href="/early-access"
              className="text-sm font-medium text-[var(--foreground)] underline decoration-[var(--border-subtle)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              Join Early Access
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
