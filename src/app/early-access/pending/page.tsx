import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EarlyAccessRestartButton } from "@/components/early-access-restart-button";
import { EarlyAccessPendingStatus } from "@/components/early-access-pending-status";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default async function EarlyAccessPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const { email, sent } = await searchParams;
  const emailSent = sent !== "0";
  // Only worth polling if this browser is the one that registered — a
  // direct visit to this URL with no session cookie has nothing to watch.
  const hasSession = Boolean(await getRegisteredCreatorIdFromCookie());

  return (
    <>
      <SiteHeader />
      <EarlyAccessPendingStatus enabled={hasSession} />
      <main className="flex-1">
        {emailSent ? (
          <>
            <h1>Check your email to confirm your registration.</h1>
            <p>
              We&apos;ve sent a confirmation link{email ? <> to {email}</> : null}. The link
              expires in 24 hours.
            </p>
          </>
        ) : (
          <>
            <h1>Your registration was saved, but we couldn&apos;t send the confirmation email.</h1>
            <p>
              We weren&apos;t able to deliver a confirmation link{email ? <> to {email}</> : null}{" "}
              right now. Please submit the form again with the same email, or try a different
              email below.
            </p>
          </>
        )}

        <div>
          <EarlyAccessRestartButton />
        </div>

        <Link href="/">Back to homepage</Link>
      </main>
      <SiteFooter />
    </>
  );
}
