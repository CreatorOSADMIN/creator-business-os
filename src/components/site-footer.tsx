import Link from "next/link";
import { CookiePreferencesLink } from "@/components/consent/cookie-preferences-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="font-display text-lg font-medium">CreatorOS</span>
            <p className="mt-2 max-w-xs text-sm text-[var(--ink-muted)]">
              Building the operating system for independent creators. Currently in early access.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4">
            <FooterColumn
              title="Product"
              links={[
                { href: "/", label: "CreatorOS" },
                { href: "/early-access", label: "Early Access" },
                { href: "/updates", label: "Updates" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms" },
              ]}
              extra={<CookiePreferencesLink />}
            />
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
          <p>Made for creators, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  extra,
}: {
  title: string;
  links: { href: string; label: string }[];
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono-label text-xs uppercase text-[var(--ink-muted)]">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[var(--foreground)]/80 hover:text-[var(--accent)]">
              {link.label}
            </Link>
          </li>
        ))}
        {extra && <li>{extra}</li>}
      </ul>
    </div>
  );
}
