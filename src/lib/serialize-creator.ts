import type { Creator } from "@prisma/client";

export function serializeCreator(creator: Creator) {
  return {
    ...creator,
    platforms: safeParseArray(creator.platforms),
    productInterests: safeParseArray(creator.productInterests),
  };
}

function safeParseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

