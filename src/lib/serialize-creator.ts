import type { Creator } from "@prisma/client";

export function serializeCreator(creator: Creator) {
  return {
    ...creator,
    platforms: safeParseArray(creator.platforms),
    platformUrls: safeParseObject(creator.platformUrls),
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

function safeParseObject(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
