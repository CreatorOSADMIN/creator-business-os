import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CreatorOS — Build smarter. Grow with data.",
    template: "%s | CreatorOS",
  },
  description:
    "CreatorOS is building a unified analytics and growth platform for digital creators. Join the Early Access program.",
  openGraph: {
    title: "CreatorOS — Build smarter. Grow with data.",
    description:
      "A unified analytics and growth platform for digital creators, currently in early access.",
    url: siteUrl,
    siteName: "CreatorOS",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
