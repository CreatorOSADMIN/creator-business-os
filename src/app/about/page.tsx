import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what CreatorOS is building: a unified analytics and growth platform that helps creators run their content like a business.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <h1>About</h1>
      </main>
      <SiteFooter />
    </>
  );
}
