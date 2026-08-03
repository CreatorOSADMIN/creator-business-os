import Link from "next/link";
import { CookiePreferencesLink } from "@/components/consent/cookie-preferences-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-lg font-bold tracking-tight text-text">
              Creator<span className="text-accent">OS</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              One dashboard for your creator business — unified analytics across every platform
              you publish to.
            </p>
          </div>

          <nav aria-label="Footer" className="col-span-2 grid grid-cols-2 gap-10 md:col-span-3 md:grid-cols-3">
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

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 font-mono-ui text-xs uppercase tracking-widest text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
          <p>Built for creators, by creators</p>
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
      <p className="font-mono-ui text-xs uppercase tracking-widest text-text-faint">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
              {link.label}
            </Link>
          </li>
        ))}
        {extra && <li className="text-sm text-text-muted">{extra}</li>}
      </ul>
    </div>
  );
}
