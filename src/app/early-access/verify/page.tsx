import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--danger)]">
            !
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-tight">Link not valid</h1>
          <p className="mt-4 text-[var(--ink-muted)]">{message}</p>

          <Link
            href="/early-access"
            className="mt-10 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
          >
            ← Back to Early Access
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
