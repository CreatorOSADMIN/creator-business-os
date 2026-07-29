/** Escapes a single CSV field per RFC 4180 (quotes values containing commas, quotes, or newlines). */
export function toCsvValue(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Builds a CSV document (CRLF line endings) from a header row and data rows. */
export function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\r\n");
}
