import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow } from "@/components/landing/eyebrow";
import { TrackEventOnMount } from "@/components/analytics/track-event-on-mount";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "You're on the list",
  robots: { index: false, follow: false },
};

export default async function EarlyAccessSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ref?: string }>;
}) {
  const { id, ref } = await searchParams;
  const siteUrl = getSiteUrl();
  const referralLink = ref ? `${siteUrl}/early-access?ref=${ref}` : null;

  return (
    <>
      <SiteHeader />
      {id && <TrackEventOnMount event="email_verified" props={{ creatorId: id }} />}
      {/* Primary GA4 conversion event — mark "early_access_signup" as a
          conversion in the GA4 property's Admin > Events settings. */}
      {id && <TrackEventOnMount event="early_access_signup" props={{ creatorId: id }} />}
      <main className="flex-1 bg-bg">
        <section className="px-6 py-28 sm:px-10 sm:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Confirmed</Eyebrow>
            <h1 className="mt-6 text-balance font-display text-4xl font-bold tracking-[-0.03em] text-text sm:text-6xl">
              You&apos;re on the list.
            </h1>

            {id && (
              <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 rounded-2xl border border-border bg-bg-elevated p-6 text-left">
                <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                  Reference
                </p>
                <p className="break-all text-sm text-text">{id}</p>
                {referralLink && (
                  <>
                    <p className="mt-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                      Referral link
                    </p>
                    <p className="break-all text-sm text-text">{referralLink}</p>
                  </>
                )}
              </div>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
              >
                Back to homepage
              </Link>
              <Link
                href="/updates"
                className="rounded-full border border-border-strong px-7 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
              >
                See what&apos;s next
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
