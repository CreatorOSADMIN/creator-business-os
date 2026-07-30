import Script from "next/script";
import { getConsentBootstrapScript } from "@/lib/consent";

/**
 * Sets Google Consent Mode v2 defaults before any other script runs.
 * Must load with `beforeInteractive` — this only initializes the consent
 * signals in `dataLayer`, it does not load gtag.js or contact Google, so it
 * doesn't count as "initializing" GA4 (see `AnalyticsGate`, which gates the
 * actual GA4/Speed Insights scripts on consent).
 */
export function ConsentBootstrapScript() {
  return (
    <Script id="consent-mode-bootstrap" strategy="beforeInteractive">
      {getConsentBootstrapScript()}
    </Script>
  );
}
