"use client";

import { requestConsentPreferencesPanel } from "@/lib/consent";

/** Reopens the cookie consent banner's preferences panel. Styled to match the surrounding footer links. */
export function CookiePreferencesLink() {
  return (
    <button type="button" onClick={requestConsentPreferencesPanel}>
      Cookie Preferences
    </button>
  );
}
