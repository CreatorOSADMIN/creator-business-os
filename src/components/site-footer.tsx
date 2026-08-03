import Link from "next/link";
import { CookiePreferencesLink } from "@/components/consent/cookie-preferences-link";

export function SiteFooter() {
  return (
    <footer>
      <div>
        <div>
          <p>CreatorOS</p>
        </div>
        <nav aria-label="Footer">
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
        <p>© {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
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
      <p>{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
        {extra && <li>{extra}</li>}
      </ul>
    </div>
  );
}
