import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow } from "@/components/landing/eyebrow";
import { TrackedLink } from "@/components/analytics/tracked-link";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 py-28 sm:px-10 sm:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>404</Eyebrow>
            <h1 className="mt-6 text-balance font-display text-4xl font-bold tracking-[-0.03em] text-text sm:text-6xl">
              Page not found.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-text-muted">
              The page you&apos;re looking for doesn&apos;t exist or may have moved.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
              >
                Back to homepage
              </Link>
              <TrackedLink
                href="/early-access"
                event="early_access_click"
                eventProps={{ location: "not_found" }}
                className="rounded-full border border-border-strong px-7 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
              >
                Join Early Access
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
