import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl tracking-tight">{title}</h1>
          {updated && <p className="mt-2 text-sm text-[var(--ink-muted)]">Last updated: {updated}</p>}
          <div className="prose-legal mt-10 space-y-6 text-[15px] leading-relaxed text-[var(--foreground)]/90">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
