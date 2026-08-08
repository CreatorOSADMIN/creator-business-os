// Rendering an `href`/`src` straight from a database or third-party API
// value is an XSS vector (e.g. a `javascript:` URL) even though the
// visible text itself is safe under React's default escaping. This never
// trusts scheme-relative or non-http(s) values.
export function isSafeHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
