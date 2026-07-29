import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    default: "CreatorOS — Build smarter. Grow with data.",
    template: "%s | CreatorOS",
  },
  description:
    "CreatorOS is building a unified analytics and growth platform for digital creators. Join the Early Access program.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "CreatorOS — Build smarter. Grow with data.",
    description:
      "A unified analytics and growth platform for digital creators, currently in early access.",
    url: siteUrl,
    siteName: "CreatorOS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "CreatorOS — Build smarter. Grow with data.",
    description:
      "A unified analytics and growth platform for digital creators, currently in early access.",
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
        <GoogleAnalytics measurementId={getPublicEnv().NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <SpeedInsights />
        {children}
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