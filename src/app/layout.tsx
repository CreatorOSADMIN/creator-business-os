import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsGate } from "@/components/consent/analytics-gate";
import { ConsentBootstrapScript } from "@/components/consent/consent-bootstrap-script";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import { getPublicEnv } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";
import { Analytics } from "@vercel/analytics/next"

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-family",
});
const monoUiFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-ui-family",
});

const siteUrl = getSiteUrl();
// Canonical brand domain per organization records — used for structured
// data only, independent of the deployment's NEXT_PUBLIC_SITE_URL. Must
// match the canonical www host used by getSiteUrl()/siteUrl above so
// structured data and metadata never disagree on www vs apex.
const ORGANIZATION_URL = "https://www.creatoroslaunch.site";
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
    default: "CreatorOS — Creator Business Management Platform (Free Early Access)",
    template: "%s | CreatorOS",
  },
  description:
    "CreatorOS is an upcoming creator business dashboard unifying analytics, brand deals, and revenue across YouTube, Instagram, TikTok, Twitch, X, LinkedIn, Facebook, Patreon, and Substack. Join the free early access waitlist — freemium at launch.",
  keywords: [
    "creator business management platform",
    "creator economy tools",
    "creator operating system",
    "manage brand deals",
    "creator analytics",
    "creator workflow management",
    "creator business dashboard",
    "influencer business tools",
  ],
  applicationName: "CreatorOS",
  category: "business",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "CreatorOS — Creator Business Management Platform",
    description:
      "One dashboard for your creator business: unified analytics, brand deals, and revenue across every platform you publish to. Free early access, freemium at launch.",
    url: siteUrl,
    siteName: "CreatorOS",
    type: "website",
    locale: "en_US",
    // TODO(design): /public/og-default.png does not exist yet in the repo.
    // Add a real 1200x630 social preview image at that path — this
    // reference is metadata-only and safe to ship ahead of the asset.
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "CreatorOS — Creator Business Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorOS — Creator Business Management Platform",
    description:
      "One dashboard for your creator business: unified analytics, brand deals, and revenue across every platform you publish to. Free early access, freemium at launch.",
    // Same placeholder asset as openGraph.images above — see TODO there.
    images: ["/og-default.png"],
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
    logo: `${ORGANIZATION_URL}/logo.png`,
    sameAs: SOCIAL_PROFILES,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CreatorOS",
    url: siteUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CreatorOS",
    description:
      "CreatorOS is an upcoming creator business dashboard unifying analytics, brand deals, and revenue across YouTube, Instagram, TikTok, Twitch, X, LinkedIn, Facebook, Patreon, and Substack.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${displayFont.variable} ${monoUiFont.variable}`}
    >
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