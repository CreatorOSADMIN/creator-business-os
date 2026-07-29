"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  registerAnalyticsProvider,
  type AnalyticsEvent,
  type AnalyticsProps,
} from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Wires the app's existing `trackEvent` API to real GA4 (gtag.js).
 *
 * - Loads gtag.js with `next/script` (`afterInteractive`) for optimal
 *   loading without blocking hydration.
 * - Disables gtag's automatic `page_view` (`send_page_view: false`) since
 *   the app already fires an explicit `homepage_view` custom event.
 * - Registers a provider on mount so every existing `trackEvent(...)` call
 *   site (form, tracked links, etc.) starts sending real GA4 events with
 *   no changes needed elsewhere.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  useEffect(() => {
    registerAnalyticsProvider((event: AnalyticsEvent, props?: AnalyticsProps) => {
      window.gtag?.("event", event, props ?? {});
    });
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
