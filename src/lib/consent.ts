/**
 * Cookie consent state + Google Consent Mode v2 wiring.
 *
 * Single source of truth for what's stored in localStorage, what events
 * fire when consent changes, and how a `ConsentPreferences` value maps to
 * the four Consent Mode v2 signals. Both the consent banner and the
 * analytics gate import from here so the mapping only lives in one place.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const CONSENT_STORAGE_KEY = "creatoros_cookie_consent_v1";
export const CONSENT_VERSION = 1;

/** Fired on `window` whenever consent is saved, with the new state as `detail`. */
export const CONSENT_UPDATED_EVENT = "creatoros:consent-updated";
/** Fired on `window` to ask the banner to reopen the preferences panel. */
export const OPEN_CONSENT_PREFERENCES_EVENT = "creatoros:open-consent-preferences";

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
}

export interface StoredConsent extends ConsentPreferences {
  version: number;
  consentedAt: string;
}

export const ALL_CONSENT_GRANTED: ConsentPreferences = { analytics: true, marketing: true };
export const ALL_CONSENT_DENIED: ConsentPreferences = { analytics: false, marketing: false };

/** Reads and validates the stored consent choice. Returns null if none exists, it's malformed, or it's from an older schema version. */
export function getStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== CONSENT_VERSION || typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }
    return parsed as StoredConsent;
  } catch {
    return null;
  }
}

/** Maps our two user-facing categories to the four Consent Mode v2 signals. */
export function buildGtagConsentPayload(prefs: ConsentPreferences): Record<string, "granted" | "denied"> {
  return {
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_storage: prefs.marketing ? "granted" : "denied",
    ad_user_data: prefs.marketing ? "granted" : "denied",
    ad_personalization: prefs.marketing ? "granted" : "denied",
  };
}

/** Pushes a `consent update` to gtag, if it's loaded. Safe to call even if it isn't. */
export function applyConsentToGtag(prefs: ConsentPreferences): void {
  if (typeof window === "undefined") return;
  window.gtag?.("consent", "update", buildGtagConsentPayload(prefs));
}

/**
 * Persists the user's choice, updates Consent Mode, and notifies the rest
 * of the app (analytics gate, banner) so everything reacts immediately —
 * no page reload needed.
 */
export function saveConsent(prefs: ConsentPreferences): StoredConsent {
  const stored: StoredConsent = {
    ...prefs,
    version: CONSENT_VERSION,
    consentedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Storage can fail (private browsing, quota). The choice still applies
      // for this session via the in-memory event below; it just won't persist.
    }
    applyConsentToGtag(prefs);
    window.dispatchEvent(new CustomEvent<StoredConsent>(CONSENT_UPDATED_EVENT, { detail: stored }));
  }
  return stored;
}

/** Asks the banner (mounted once, near the root) to reopen its preferences panel. */
export function requestConsentPreferencesPanel(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_CONSENT_PREFERENCES_EVENT));
}

/**
 * Inline bootstrap script (rendered with `beforeInteractive`) that sets
 * Consent Mode v2 defaults before any other script runs — denied unless a
 * prior visit already recorded a choice, in which case it restores that
 * choice immediately so returning visitors don't get a flash of "denied".
 */
export function getConsentBootstrapScript(): string {
  return `(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var analytics = false, marketing = false;
  try {
    var raw = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version === ${CONSENT_VERSION}) {
        analytics = !!parsed.analytics;
        marketing = !!parsed.marketing;
      }
    }
  } catch (e) {}
  gtag('consent', 'default', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
    wait_for_update: 500
  });
})();`;
}
