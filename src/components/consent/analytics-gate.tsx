"use client";

import { useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CONSENT_UPDATED_EVENT, getStoredConsent, type StoredConsent } from "@/lib/consent";

/**
 * Renders GA4 and Vercel Speed Insights only once the visitor has granted
 * analytics consent. Listens for `CONSENT_UPDATED_EVENT` so accepting (or
 * later changing) consent mounts/unmounts these immediately, with no page
 * reload required.
 */
export function AnalyticsGate({ measurementId }: { measurementId: string }) {
  const [consent, setConsent] = useState<StoredConsent | null>(() => getStoredConsent());

  useEffect(() => {
    function handleUpdate(event: Event) {
      setConsent((event as CustomEvent<StoredConsent>).detail);
    }

    window.addEventListener(CONSENT_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, handleUpdate);
  }, []);

  if (!consent?.analytics) return null;

  return (
    <>
      <GoogleAnalytics measurementId={measurementId} />
      <SpeedInsights />
    </>
  );
}
