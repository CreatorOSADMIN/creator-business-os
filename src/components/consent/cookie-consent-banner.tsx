"use client";

import { useEffect, useState } from "react";
import {
  ALL_CONSENT_DENIED,
  ALL_CONSENT_GRANTED,
  OPEN_CONSENT_PREFERENCES_EVENT,
  getStoredConsent,
  saveConsent,
  type ConsentPreferences,
} from "@/lib/consent";

/**
 * GDPR cookie banner: Accept / Reject / Manage preferences. Shown once —
 * hidden permanently after any choice is saved (`getStoredConsent()` on
 * mount) — and can be reopened at any time via `requestConsentPreferencesPanel()`
 * (wired to the "Cookie Preferences" link in the footer).
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !getStoredConsent());
  const [managing, setManaging] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>(() => {
    const stored = getStoredConsent();
    return stored ? { analytics: stored.analytics, marketing: stored.marketing } : ALL_CONSENT_DENIED;
  });

  useEffect(() => {
    function handleOpenPreferences() {
      const current = getStoredConsent();
      if (current) setPrefs({ analytics: current.analytics, marketing: current.marketing });
      setManaging(true);
      setVisible(true);
    }

    window.addEventListener(OPEN_CONSENT_PREFERENCES_EVENT, handleOpenPreferences);
    return () => window.removeEventListener(OPEN_CONSENT_PREFERENCES_EVENT, handleOpenPreferences);
  }, []);

  function choose(next: ConsentPreferences) {
    saveConsent(next);
    setPrefs(next);
    setVisible(false);
    setManaging(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md sm:px-0 sm:pb-0"
    >
      <div className="rounded-2xl border border-border-strong bg-bg-elevated p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-text-faint">
          <span className="text-accent">[</span> Cookies <span className="text-accent">]</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          We use cookies to run this site and, with your permission, to understand how it&apos;s
          used. See our{" "}
          <a href="/privacy" className="text-text underline underline-offset-2 hover:text-accent">
            Privacy Policy
          </a>{" "}
          for details.
        </p>

        {managing && (
          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5">
            <PreferenceRow
              label="Strictly necessary"
              description="Required for the site to function. Always on."
              checked
              disabled
            />
            <PreferenceRow
              label="Analytics"
              description="Helps us understand site usage (Google Analytics, Speed Insights)."
              checked={prefs.analytics}
              onChange={(analytics) => setPrefs((p) => ({ ...p, analytics }))}
            />
            <PreferenceRow
              label="Marketing"
              description="Used for advertising measurement and personalization."
              checked={prefs.marketing}
              onChange={(marketing) => setPrefs((p) => ({ ...p, marketing }))}
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {managing ? (
            <button
              type="button"
              onClick={() => choose(prefs)}
              className="rounded-full bg-accent px-5 py-2.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
            >
              Save preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={() => choose(ALL_CONSENT_GRANTED)}
              className="rounded-full bg-accent px-5 py-2.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
            >
              Accept
            </button>
          )}
          <button
            type="button"
            onClick={() => choose(ALL_CONSENT_DENIED)}
            className="rounded-full border border-border-strong px-5 py-2.5 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
          >
            Reject{managing ? " all" : ""}
          </button>
          {!managing && (
            <button
              type="button"
              onClick={() => setManaging(true)}
              className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text"
            >
              Manage preferences
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-accent"
      />
      <span className="flex flex-col gap-0.5">
        <span className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text">
          {label}
        </span>
        <span className="text-xs leading-relaxed text-text-muted">{description}</span>
      </span>
    </label>
  );
}
