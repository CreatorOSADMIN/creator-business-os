import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <h1>Page not found.</h1>
        <div>
          <Link href="/">Back to homepage</Link>
          <Link href="/early-access">Join Early Access</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
