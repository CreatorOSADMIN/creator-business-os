import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
      <main className="flex-1">
        <h1>Join Free Early Access</h1>
        <EarlyAccessForm
          initialReferralCode={first(params.ref)}
          initialUtmSource={first(params.utm_source)}
          initialUtmMedium={first(params.utm_medium)}
          initialUtmCampaign={first(params.utm_campaign)}
        />
      </main>
      <SiteFooter />
    </>
  );
}
