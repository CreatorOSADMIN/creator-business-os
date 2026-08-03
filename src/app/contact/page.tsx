import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the CreatorOS team for Early Access questions, privacy requests, or press inquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <h1>Contact</h1>
        <p>
          <a href="mailto:ferrettiwilliam68@gmail.com">ferrettiwilliam68@gmail.com</a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
