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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <p className="text-sm text-[var(--foreground)]">
          We use cookies to run this site and, with your permission, to understand how it&apos;s
          used. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-[var(--accent)]">
            Privacy Policy
          </a>{" "}
          for details.
        </p>

        {managing && (
          <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-4">
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

        <div className="flex flex-wrap items-center gap-3">
          {managing ? (
            <button
              type="button"
              onClick={() => choose(prefs)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
            >
              Save preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={() => choose(ALL_CONSENT_GRANTED)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
            >
              Accept
            </button>
          )}
          <button
            type="button"
            onClick={() => choose(ALL_CONSENT_DENIED)}
            className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--accent-soft)]"
          >
            Reject{managing ? " all" : ""}
          </button>
          {!managing && (
            <button
              type="button"
              onClick={() => setManaging(true)}
              className="text-sm font-medium text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--accent)]"
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
    <label className={`flex items-start gap-3 ${disabled ? "opacity-70" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[var(--accent)]"
      />
      <span>
        <span className="block text-sm font-medium text-[var(--foreground)]">{label}</span>
        <span className="block text-xs text-[var(--ink-muted)]">{description}</span>
      </span>
    </label>
  );
}
