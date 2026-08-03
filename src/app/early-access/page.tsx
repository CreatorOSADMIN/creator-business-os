import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { EarlyAccessForm } from "@/components/early-access-form";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Join Free Early Access",
  description:
    "CreatorOS is an upcoming creator business dashboard for YouTube, Instagram, TikTok, Twitch, X, and more. Join the free early access waitlist and help shape a freemium platform built for creator analytics, brand deals, and revenue.",
  alternates: { canonical: "/early-access" },
};

export default async function EarlyAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const registeredCreatorId = await getRegisteredCreatorIdFromCookie();
  if (registeredCreatorId) {
    // The cookie is signed and can't be forged, but the underlying record
    // could still have been deleted — always confirm against the database
    // before treating this browser as already registered.
    const creator = await prisma.creator.findUnique({
      where: { id: registeredCreatorId },
      select: { id: true, referralCode: true, email: true, emailVerifiedAt: true },
    });
    if (creator?.emailVerifiedAt) {
      const successParams = new URLSearchParams({ id: creator.id, ref: creator.referralCode });
      redirect(`/early-access/success?${successParams.toString()}`);
    } else if (creator) {
      const pendingParams = new URLSearchParams({ email: creator.email });
      redirect(`/early-access/pending?${pendingParams.toString()}`);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Eyebrow>Free early access</Eyebrow>
              <h1 className="mt-6 text-balance font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
                Join Free Early Access
              </h1>
              <p className="mt-6 max-w-xl text-balance border-t border-border pt-6 text-lg leading-relaxed text-text-muted">
                Tell us a bit about your creator business. Takes about two minutes.
              </p>
            </Reveal>

            <Reveal delay={80} className="mt-14">
              <EarlyAccessForm
                initialReferralCode={first(params.ref)}
                initialUtmSource={first(params.utm_source)}
                initialUtmMedium={first(params.utm_medium)}
                initialUtmCampaign={first(params.utm_campaign)}
              />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
