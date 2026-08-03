import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 2026">
      <p>
        These terms cover the CreatorOS Early Access program described on this site. They will be
        revised as the product develops and before any paid service launches.
      </p>
      <section>
        <h2>The Early Access program</h2>
        <p>
          By registering for CreatorOS Early Access, you are joining a waitlist for a product
          that is still in development. Registration does not constitute purchase of, or
          guaranteed access to, any current or future paid service.
        </p>
      </section>
      <section>
        <h2>Early Access benefit</h2>
        <p>
          Creators who join the Early Access Program will be eligible for a 50% discount on the
          first three months of their paid subscription after launch, subject to the final terms
          of the program as published at that time.
        </p>
      </section>
      <section>
        <h2>Referrals</h2>
        <p>
          Creators may share a personal referral link. Any rewards associated with referrals are
          not automatically granted at the time of a referred creator&apos;s registration; they
          are subject to qualification criteria to be defined and published before the referral
          program is activated.
        </p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms as CreatorOS develops. We will communicate material changes
          to registered creators.
        </p>
      </section>
    </LegalPage>
  );
}
