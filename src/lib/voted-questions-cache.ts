// Client-only cache of "questions this browser has upvoted", used purely to
// avoid the /questions upvote flash: UpvoteButton always renders unvoted on
// first paint (SSR/ISR can't know the visitor's vote — see the GET handler
// in api/questions/[slug]/upvote), then corrects itself once the per-visitor
// check resolves. For a repeat visit that correction is almost always "yes,
// still voted", so seeding from this cache in a layout effect (before the
// browser paints) lets that first frame already be correct instead of
// flashing unvoted-then-voted.
//
// Only "voted" entries are stored. Absence means "unknown", not "not
// voted" — we never want to optimistically render a false negative, only
// skip a known-true wait.
const STORAGE_KEY = "creatoros:voted-questions";

function readCache(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getCachedVote(slug: string): boolean | null {
  const cache = readCache();
  return slug in cache ? true : null;
}

export function setCachedVote(slug: string, voted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const cache = readCache();
    if (voted) {
      cache[slug] = true;
    } else {
      delete cache[slug];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private browsing / quota exceeded / storage disabled — the button
    // still works correctly, it just loses the instant-repaint shortcut.
  }
}
