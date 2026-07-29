import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { getPublicEnv } from "@/lib/env";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
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
