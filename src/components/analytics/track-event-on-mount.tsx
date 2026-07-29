"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

/**
 * Renders nothing. Fires a single analytics event when the containing page
 * mounts. Lets server components (e.g. the homepage, the success page)
 * trigger client-side tracking without becoming client components
 * themselves.
 */
export function TrackEventOnMount({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
}) {
  useEffect(() => {
    trackEvent(event, props);
    // Fire once per mount only — deliberately not re-running on prop identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
