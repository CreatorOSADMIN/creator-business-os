"use client";

import { requestConsentPreferencesPanel } from "@/lib/consent";

/** Reopens the cookie consent banner's preferences panel. Styled to match the surrounding footer links. */
export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={requestConsentPreferencesPanel}
      className="text-left text-[var(--foreground)]/80 hover:text-[var(--accent)]"
    >
      Cookie Preferences
    </button>
  );
}
