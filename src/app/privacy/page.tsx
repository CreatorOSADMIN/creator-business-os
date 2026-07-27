import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <p>
        This policy covers the CreatorOS Early Access program described on this site. It will be
        revised as the product develops and before any paid service launches.
      </p>
      <section>
        <h2 className="font-medium text-lg">What we collect</h2>
        <p>
          When you join the Early Access program, we collect the information you provide in the
          registration form: your name, creator handle, email address, country, social platform
          profiles, audience size range, publishing habits, and the answers you give about your
          goals and challenges as a creator. We also record technical details such as referral
          codes and campaign parameters (UTM values) associated with your registration.
        </p>
      </section>
      <section>
        <h2 className="font-medium text-lg">How we use it</h2>
        <p>
          We use this information to evaluate and manage the Early Access program, to contact you
          about the status of your application and the development of CreatorOS, and — only if
          you opt in separately — to send you product updates and marketing communications.
        </p>
      </section>
      <section>
        <h2 className="font-medium text-lg">Your rights</h2>
        <p>
          Depending on where you live, you may have rights under applicable data protection law
          (including the EU General Data Protection Regulation) to access, correct, delete, or
          export your personal data, and to withdraw consent to marketing communications at any
          time. To exercise these rights, contact us using the details on our Contact page.
        </p>
      </section>
      <section>
        <h2 className="font-medium text-lg">Data retention</h2>
        <p>
          We retain Early Access registration data for as long as the program is active and for a
          reasonable period afterward, unless you request earlier deletion.
        </p>
      </section>
      <section>
        <h2 className="font-medium text-lg">Contact</h2>
        <p>
          Questions about this policy can be sent through our Contact page.
        </p>
      </section>
    </LegalPage>
  );
}
