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
        <h1>{title}</h1>
        {updated && <p>Last updated: {updated}</p>}
        <div>{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
