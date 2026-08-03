import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GOFUNDME_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Development updates and roadmap for CreatorOS — built in the open, and dependent on community support to keep going.",
  alternates: { canonical: "/updates" },
};

const ROADMAP = [
  { phase: "Phase 1", status: "In progress", title: "Foundation & early access" },
  { phase: "Phase 2", status: "Planned", title: "Unified analytics" },
  { phase: "Phase 3", status: "Planned", title: "Insight & recommendations" },
  { phase: "Phase 4", status: "Future", title: "Brand discovery" },
] as const;

export default function UpdatesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <h1>Updates</h1>
        <ul>
          {ROADMAP.map((item) => (
            <li key={item.phase}>
              {item.phase} — {item.status} — {item.title}
            </li>
          ))}
        </ul>
        {GOFUNDME_URL ? (
          <a href={GOFUNDME_URL} target="_blank" rel="noopener noreferrer">
            Support on GoFundMe
          </a>
        ) : (
          <Link href="/contact">Get in touch to support us</Link>
        )}
        <p>
          <Link href="/early-access">Join Early Access</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
