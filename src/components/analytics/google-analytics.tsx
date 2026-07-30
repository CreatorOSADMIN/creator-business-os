"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  registerAnalyticsProvider,
  type AnalyticsEvent,
  type AnalyticsProps,
} from "@/lib/analytics";

// `window.gtag`/`window.dataLayer` are declared globally in `@/lib/consent`.

/**
 * Wires the app's existing `trackEvent` API to real GA4 (gtag.js).
 *
 * Only ever rendered by `AnalyticsGate` once analytics consent has been
 * granted (see `src/components/consent`), so this component itself doesn't
 * need to check consent — it just needs to make sure Consent Mode reflects
 * "granted" before `config` runs, in case gtag.js hadn't loaded yet.
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
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
