import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function EarlyAccessLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <p>Loading…</p>
      </main>
      <SiteFooter />
    </>
  );
}
