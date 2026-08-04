/**
 * URL slug generation for published questions (e.g.
 * /questions/how-does-creatoros-work).
 */

const MAX_SLUG_LENGTH = 80;

export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");

  return base || "question";
}

/**
 * Appends a short numeric suffix (-2, -3, ...) until `isTaken` reports the
 * candidate slug is free. `isTaken` is expected to exclude the record being
 * (re)published itself, if any.
 */
export async function generateUniqueSlug(
  title: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;
  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
