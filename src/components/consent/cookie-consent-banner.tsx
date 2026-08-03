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
      className="fixed inset-x-0 bottom-0"
    >
      <div>
        <p>
          We use cookies to run this site and, with your permission, to understand how it&apos;s
          used. See our <a href="/privacy">Privacy Policy</a> for details.
        </p>

        {managing && (
          <div>
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

        <div>
          {managing ? (
            <button type="button" onClick={() => choose(prefs)}>
              Save preferences
            </button>
          ) : (
            <button type="button" onClick={() => choose(ALL_CONSENT_GRANTED)}>
              Accept
            </button>
          )}
          <button type="button" onClick={() => choose(ALL_CONSENT_DENIED)}>
            Reject{managing ? " all" : ""}
          </button>
          {!managing && (
            <button type="button" onClick={() => setManaging(true)}>
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
    <label>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span>
        <span>{label}</span>
        <span>{description}</span>
      </span>
    </label>
  );
}
