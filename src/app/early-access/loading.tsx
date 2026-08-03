import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function EarlyAccessLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 py-28 sm:px-10 sm:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
              Loading…
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
