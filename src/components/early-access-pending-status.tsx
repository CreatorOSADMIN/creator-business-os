"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Light polling only: a few seconds apart, slowing down over time, and
// capped so an abandoned tab doesn't poll forever.
const POLL_INTERVAL_MS = 5000;
const SLOWDOWN_AFTER_MS = 2 * 60 * 1000; // after 2 minutes, ease off
const SLOW_POLL_INTERVAL_MS = 15000;
const STOP_AFTER_MS = 20 * 60 * 1000; // give up after 20 minutes

interface EarlyAccessPendingStatusProps {
  /** Whether this browser has a signed session cookie worth polling for. */
  enabled: boolean;
}

/**
 * Renders nothing visible — it just watches for the registration on this
 * device to become verified (typically because the confirmation link was
 * opened on another device) and redirects to the success/referral screen
 * as soon as it does.
 */
export function EarlyAccessPendingStatus({ enabled }: EarlyAccessPendingStatusProps) {
  const router = useRouter();
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    startedAtRef.current = Date.now();
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      if (cancelled) return;

      // Don't burn requests while the tab isn't visible; resume when it is.
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch("/api/early-access/status", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.verified && data.id) {
              const params = new URLSearchParams({ id: data.id });
              if (data.referralCode) params.set("ref", data.referralCode);
              router.push(`/early-access/success?${params.toString()}`);
              return;
            }
          }
        } catch {
          // Network hiccup — just try again on the next tick.
        }
      }

      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      if (elapsed >= STOP_AFTER_MS) return;

      const nextInterval = elapsed >= SLOWDOWN_AFTER_MS ? SLOW_POLL_INTERVAL_MS : POLL_INTERVAL_MS;
      timeoutId = setTimeout(poll, nextInterval);
    }

    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        // Check right away when the user comes back to the tab.
        clearTimeout(timeoutId);
        poll();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, router]);

  return null;
}
