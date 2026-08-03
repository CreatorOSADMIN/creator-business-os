import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow } from "@/components/landing/eyebrow";
import { verifyCreatorEmailToken } from "@/lib/email-verification";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default async function EarlyAccessVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyCreatorEmailToken(token ?? "");

  if (result.ok) {
    const params = new URLSearchParams({ id: result.creatorId, ref: result.referralCode });
    redirect(`/early-access/success?${params.toString()}`);
  }

  const message =
    result.reason === "expired"
      ? "This verification link has expired. Submit the Early Access form again with the same email to receive a new one."
      : "This verification link is invalid or has already been used. Submit the Early Access form again with the same email to receive a new one.";

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 py-28 sm:px-10 sm:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Link not valid</Eyebrow>
            <h1 className="mt-6 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-text sm:text-5xl">
              Link not valid
            </h1>
            <p className="mx-auto mt-5 max-w-md text-text-muted">{message}</p>
            <div className="mt-10">
              <Link
                href="/early-access"
                className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
              >
                Back to Early Access
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
