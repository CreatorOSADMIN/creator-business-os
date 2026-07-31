import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsGate } from "@/components/consent/analytics-gate";
import { ConsentBootstrapScript } from "@/components/consent/consent-bootstrap-script";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import { getPublicEnv } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
// Canonical brand domain per organization records — used for structured
// data only, independent of the deployment's NEXT_PUBLIC_SITE_URL.
const ORGANIZATION_URL = "https://creatoroslaunch.site";
// NOTE: these are the brand's assumed handles based on the "creatoros"
// naming used across the codebase (email domain, site domain). Verify and
// update if the real handles differ.
const SOCIAL_PROFILES = [
  "https://www.instagram.com/creator__os_/",
  "https://www.tiktok.com/@creator.os__?lang=it-IT",
  "https://www.youtube.com/@CreatorOS_OF",
  "https://x.com/CreatorOS_",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CreatorOS — The Business Operating System for Creators",
    template: "%s | CreatorOS",
  },
  description:
    "CreatorOS unifies YouTube, TikTok, and Instagram data into one creator business dashboard, so you can grow on evidence, not guesswork. Join Early Access today.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "CreatorOS — The Business Operating System for Creators",
    description:
      "One dashboard for your creator business: unified analytics, clear insight, and growth tools built with early creators. Currently in early access.",
    url: siteUrl,
    siteName: "CreatorOS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "CreatorOS — The Business Operating System for Creators",
    description:
      "One dashboard for your creator business: unified analytics, clear insight, and growth tools built with early creators. Currently in early access.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// Static structured data — no user input involved, safe to inline.
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CreatorOS",
    url: ORGANIZATION_URL,
    logo: `${ORGANIZATION_URL}/favicon.ico`,
    sameAs: SOCIAL_PROFILES,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CreatorOS",
    url: siteUrl,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <ConsentBootstrapScript />
        <AnalyticsGate measurementId={getPublicEnv().NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        {children}
        <CookieConsentBanner />
        <script
          type="application/ld+json"
          // Structured data is a static, developer-authored object (no user
          // input), so this is safe from injection.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}