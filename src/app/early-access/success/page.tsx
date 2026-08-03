import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
      <main className="flex-1">
        <h1>You&apos;re on the list.</h1>

        {id && (
          <div>
            <p>Reference: {id}</p>
            {referralLink && <p>Referral link: {referralLink}</p>}
          </div>
        )}

        <div>
          <Link href="/">Back to homepage</Link>
          <Link href="/updates">See what&apos;s next</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
