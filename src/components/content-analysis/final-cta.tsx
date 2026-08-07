import { Reveal } from "@/components/landing/reveal";
import { TrackedLink } from "@/components/analytics/tracked-link";

/**
 * Closing CTA reused across the Content Analysis Demo flow (form page and
 * report placeholder) — same visual language as the homepage/about final
 * CTA sections, just pointed at the "Unlock the full experience" message.
 */
export function ContentAnalysisFinalCta({ location }: { location: string }) {
  return (
    <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="text-balance font-display text-4xl font-bold tracking-[-0.03em] text-text sm:text-6xl">
            Unlock the Full CreatorOS Experience
          </h2>
          <p className="mx-auto mt-5 max-w-md text-text-muted">
            This is a preview of what CreatorOS can surface from your content. Join the free
            early access program to bring real analysis to your own channels.
          </p>
          <div className="mt-10">
            <TrackedLink
              href="/early-access"
              event="early_access_click"
              eventProps={{ location }}
              className="inline-block rounded-full bg-accent px-8 py-3.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
            >
              Join Early Access
            </TrackedLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
