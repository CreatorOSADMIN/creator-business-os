import { describe, it, expect } from "vitest";
import { markdownToHtml, markdownToExcerpt } from "../markdown";

describe("markdownToHtml", () => {
  it("renders paragraphs, bold, italic", () => {
    const html = markdownToHtml("Hello **world**, this is *great*.");
    expect(html).toBe("<p>Hello <strong>world</strong>, this is <em>great</em>.</p>");
  });

  it("renders headings", () => {
    expect(markdownToHtml("## Section title")).toBe("<h2>Section title</h2>");
    expect(markdownToHtml("### Sub title")).toBe("<h3>Sub title</h3>");
  });

  it("renders bullet and numbered lists", () => {
    expect(markdownToHtml("- one\n- two")).toBe("<ul><li>one</li><li>two</li></ul>");
    expect(markdownToHtml("1. one\n2. two")).toBe("<ol><li>one</li><li>two</li></ol>");
  });

  it("renders safe links only for http(s)", () => {
    expect(markdownToHtml("[docs](https://example.com)")).toContain(
      '<a href="https://example.com" rel="noopener noreferrer nofollow">docs</a>'
    );
    // javascript: URIs are not recognized as links and pass through as plain (escaped) text.
    expect(markdownToHtml("[x](javascript:alert(1))")).not.toContain("<a");
  });

  it("never emits raw HTML from input — script tags are escaped, not executed", () => {
    const html = markdownToHtml("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("markdownToExcerpt", () => {
  it("strips markdown syntax and truncates", () => {
    expect(markdownToExcerpt("## Title\n\nSome **bold** text here.")).toBe(
      "Title Some bold text here."
    );
  });

  it("truncates with an ellipsis past maxLength", () => {
    const long = "a".repeat(200);
    const excerpt = markdownToExcerpt(long, 50);
    expect(excerpt.length).toBe(50);
    expect(excerpt.endsWith("…")).toBe(true);
  });
});
