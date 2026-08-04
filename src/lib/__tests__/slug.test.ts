import { describe, it, expect } from "vitest";
import { slugify, generateUniqueSlug } from "../slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("How Does CreatorOS Work?")).toBe("how-does-creatoros-work");
  });

  it("strips accents and punctuation", () => {
    expect(slugify("Café's Été Guide!!")).toBe("cafes-ete-guide");
  });

  it("falls back to a default for empty input", () => {
    expect(slugify("???")).toBe("question");
  });

  it("truncates very long titles", () => {
    const long = "word ".repeat(40);
    expect(slugify(long).length).toBeLessThanOrEqual(80);
  });
});

describe("generateUniqueSlug", () => {
  it("returns the base slug when free", async () => {
    const slug = await generateUniqueSlug("Hello world", async () => false);
    expect(slug).toBe("hello-world");
  });

  it("appends a numeric suffix until free", async () => {
    const taken = new Set(["hello-world", "hello-world-2"]);
    const slug = await generateUniqueSlug("Hello world", async (candidate) => taken.has(candidate));
    expect(slug).toBe("hello-world-3");
  });
});
