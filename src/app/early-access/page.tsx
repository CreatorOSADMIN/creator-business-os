import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { EarlyAccessForm } from "@/components/early-access-form";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Join Free Early Access",
  description:
    "Join CreatorOS free early access — no account required to start, just two minutes to reserve your spot. Early members help shape a freemium platform built for creator analytics, brand deals, and revenue.",
  alternates: { canonical: "/early-access" },
};

const EARLY_ACCESS_HIGHLIGHTS = [
  {
    title: "Always free to join",
    body: "Reserving your spot in early access costs nothing today and won't cost anything later.",
  },
  {
    title: "No account required upfront",
    body: "Tell us about your creator business first — there's no mandatory account creation just to get in line.",
  },
  {
    title: "First in line, first to test",
    body: "Early access means hands-on time with CreatorOS before it opens to the public, while it's still taking shape.",
  },
  {
    title: "Freemium at public launch",
    body: "CreatorOS will launch on a freemium model. Founding members who join now lock in early-adopter benefits ahead of that.",
  },
  {
    title: "Help shape what gets built",
    body: "Early members' feedback directly influences the roadmap — see what's planned on the Updates page.",
  },
];

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
                Tell us a bit about your creator business. Takes about two minutes, it&apos;s
                free, and there&apos;s no account to create just to get started.
              </p>
            </Reveal>

            <Reveal delay={120} className="mt-12">
              <ul className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-2">
                {EARLY_ACCESS_HIGHLIGHTS.map((item) => (
                  <li key={item.title}>
                    <p className="font-display text-sm font-bold text-text">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.body}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm leading-relaxed text-text-muted">
                Curious what&apos;s planned next? See the{" "}
                <TrackedLink
                  href="/updates"
                  event="cta_click"
                  eventProps={{ location: "early_access_intro" }}
                  className="text-accent underline underline-offset-2"
                >
                  product roadmap
                </TrackedLink>
                , read more{" "}
                <TrackedLink
                  href="/about"
                  event="cta_click"
                  eventProps={{ location: "early_access_intro" }}
                  className="text-accent underline underline-offset-2"
                >
                  about CreatorOS
                </TrackedLink>
                , or browse{" "}
                <TrackedLink
                  href="/questions"
                  event="cta_click"
                  eventProps={{ location: "early_access_intro" }}
                  className="text-accent underline underline-offset-2"
                >
                  answers to common questions
                </TrackedLink>
                .
              </p>
            </Reveal>

            <Reveal delay={200} className="mt-14">
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
