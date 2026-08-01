"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/#problem", label: "Why CreatorOS" },
  { href: "/updates", label: "Updates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--background)]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--foreground)] font-mono-label text-[11px] font-semibold text-[var(--surface-dark)]">
            OS
          </span>
          <span className="font-display text-lg font-medium tracking-tight">CreatorOS</span>
        </Link>
        <nav className="hidden items-center gap-9 text-[13px] font-medium text-[var(--ink-muted)] sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--foreground)]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/early-access"
            className="hidden items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[var(--accent-strong)] sm:inline-flex"
          >
            Request Early Access
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--foreground)] sm:hidden"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-[var(--border-subtle)] bg-[var(--background)] px-4 py-4 sm:hidden"
        >
          <ul className="flex flex-col gap-1 text-sm text-[var(--ink-muted)]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/early-access"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            Request Early Access
          </Link>
        </nav>
      )}
    </header>
  );
}
