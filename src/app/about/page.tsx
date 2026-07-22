import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About",
  description: "CreatorOS is building a unified analytics and growth platform for creators.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono-label text-xs uppercase text-[var(--accent)]">About</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">
            We&apos;re building CreatorOS in the open, with creators.
          </h1>
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--ink-muted)]">
            <p>
              CreatorOS started from a simple observation: creators today manage their business
              across half a dozen platforms, each with its own analytics, and none of them talk
              to each other. Understanding what&apos;s actually working — and why — takes more
              guesswork than it should.
            </p>
            <p>
              We&apos;re building a platform to bring that picture together: your data, your
              audience, and the insight to grow deliberately instead of by trial and error. In
              time, we also want to help creators get discovered by the brands and agencies
              looking for exactly what they do.
            </p>
            <p>
              We&apos;re early. Rather than build in isolation and launch a finished product, we&apos;re
              inviting a first group of creators into the process now, through our Early Access
              program, so the platform is shaped by the people who&apos;ll actually use it.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
