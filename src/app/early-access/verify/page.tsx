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
        <h1>Link not valid</h1>
        <p>{message}</p>
        <Link href="/early-access">Back to Early Access</Link>
      </main>
      <SiteFooter />
    </>
  );
}
