import Link from "next/link";
import { CookiePreferencesLink } from "@/components/consent/cookie-preferences-link";
import { FeaturedPlatforms } from "@/components/featured-platforms";
import { QUESTION_CATEGORIES, QUESTION_CATEGORY_SLUGS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-2xl font-bold tracking-tight text-text">
              Creator<span className="text-accent">OS</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              The upcoming business dashboard for creators — unified analytics, brand deals, and
              revenue across YouTube, Instagram, TikTok, Twitch, X, and more. Free to join early
              access.
            </p>
          </div>

          <nav aria-label="Footer" className="col-span-2 grid grid-cols-2 gap-10 md:col-span-3 md:grid-cols-3">
            <FooterColumn
              title="Product"
              links={[
                { href: "/", label: "CreatorOS" },
                { href: "/early-access", label: "Early Access" },
                { href: "/questions", label: "Questions" },
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

        {/* Plain server-rendered <a> links (via next/link) to each Questions
            category page, for internal PageRank distribution — no client
            component or JS-driven navigation involved. */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
            Explore Questions
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {QUESTION_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={`/questions/category/${QUESTION_CATEGORY_SLUGS[category]}`}
                  className="text-sm text-text-muted transition-colors hover:text-text"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-8 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
          <p>Built for creators, by creators</p>
        </div>

        <FeaturedPlatforms />
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
      <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">{title}</p>
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
