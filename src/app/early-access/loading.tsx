import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function EarlyAccessLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[var(--surface)]">
        <div className="mx-auto max-w-3xl animate-pulse px-6 py-16">
          <div className="h-3 w-24 rounded bg-[var(--border-subtle)]" />
          <div className="mt-3 h-10 w-2/3 rounded bg-[var(--border-subtle)]" />
          <div className="mt-5 h-4 w-full rounded bg-[var(--border-subtle)]" />
          <div className="mt-2 h-4 w-5/6 rounded bg-[var(--border-subtle)]" />
          <div className="mt-8 h-64 w-full rounded-xl bg-[var(--border-subtle)]" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
