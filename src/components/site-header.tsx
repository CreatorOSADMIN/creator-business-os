"use client";

import Link from "next/link";
import { useState } from "react";
import { TrackedLink } from "@/components/analytics/tracked-link";

const NAV_LINKS = [
  { href: "/#problem", label: "Why CreatorOS" },
  { href: "/questions", label: "Questions" },
  { href: "/updates", label: "Updates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-xl font-bold tracking-tight text-text"
        >
          Creator<span className="text-accent">OS</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <TrackedLink
            href="/early-access"
            event="early_access_click"
            eventProps={{ location: "header" }}
            className="hidden rounded-full border border-border-strong px-5 py-2 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent sm:inline-block"
          >
            Join Free Early Access
          </TrackedLink>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-border md:hidden"
          >
            <span
              className={`h-px w-4 bg-text transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-text transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`overflow-hidden border-t border-border/80 bg-bg transition-[max-height] duration-300 ease-out md:hidden ${
          open ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-6 pb-6">
          <TrackedLink
            href="/early-access"
            event="early_access_click"
            eventProps={{ location: "header_mobile" }}
            onClick={() => setOpen(false)}
            className="block rounded-full border border-border-strong px-5 py-2.5 text-center font-mono-ui text-xs uppercase tracking-[0.15em] text-text"
          >
            Join Free Early Access
          </TrackedLink>
        </div>
      </nav>
    </header>
  );
}
