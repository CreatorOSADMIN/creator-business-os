import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <Eyebrow>Legal</Eyebrow>
              <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-text sm:text-6xl">
                {title}
              </h1>
              {updated && (
                <p className="mt-6 border-t border-border pt-6 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                  Last updated: {updated}
                </p>
              )}
            </Reveal>

            <Reveal delay={80}>
              <div className="legal-prose mt-14 flex flex-col gap-10">{children}</div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
