import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EarlyAccessForm } from "@/components/early-access-form";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Join Early Access",
  description:
    "Become an early creator on CreatorOS. Join a limited early access program and help shape the platform.",
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
      select: { id: true, referralCode: true },
    });
    if (creator) {
      const successParams = new URLSearchParams({ id: creator.id, ref: creator.referralCode });
      redirect(`/early-access/success?${successParams.toString()}`);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[var(--surface)]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="font-mono-label text-xs uppercase text-[var(--accent)]">Early Access</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Become an Early Creator
          </h1>
          <p className="mt-5 max-w-xl text-[var(--ink-muted)]">
            CreatorOS is in active development. We&apos;re not selling a finished product — you&apos;re
            joining a waitlist of the first creators we&apos;ll work with. You&apos;ll be
            contacted as the platform takes shape, and you&apos;ll keep the benefits reserved for
            our earliest members.
          </p>
          <EarlyAccessForm
            initialReferralCode={first(params.ref)}
            initialUtmSource={first(params.utm_source)}
            initialUtmMedium={first(params.utm_medium)}
            initialUtmCampaign={first(params.utm_campaign)}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
