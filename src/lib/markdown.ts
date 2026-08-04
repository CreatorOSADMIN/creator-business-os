/**
 * Minimal Markdown -> HTML renderer for the answer editor.
 *
 * Deliberately not a general-purpose Markdown library: it supports the
 * small subset the answer editor's toolbar produces (bold, italic,
 * headings, links, bullet/numbered lists, paragraphs) and nothing else.
 *
 * Safety model: the input is HTML-escaped up front, so every tag in the
 * output is one this file explicitly emits. There is no path from admin
 * input to an arbitrary/raw HTML tag, which avoids needing a full HTML
 * sanitizer dependency for content that is later rendered on public pages.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Applied after escaping, so `&lt;` etc. from the escape step are inert —
// only these specific patterns can introduce tags.
function applyInlineFormatting(escaped: string): string {
  let text = escaped;

  // Links: [label](https://example.com) — http(s) only, to rule out
  // javascript:/data: URIs.
  text = text.replace(
    /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_m, label: string, url: string) => `<a href="${url}" rel="noopener noreferrer nofollow">${label}</a>`
  );

  // Bold then italic, so **a** isn't partially consumed by the italic rule.
  text = text.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  return text;
}

export function markdownToHtml(markdown: string): string {
  const escaped = escapeHtml(markdown.replace(/\r\n/g, "\n").trim());
  const lines = escaped.split("\n");

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(`<p>${applyInlineFormatting(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (list) {
      const items = list.items.map((item) => `<li>${applyInlineFormatting(item)}</li>`).join("");
      blocks.push(`<${list.type}>${items}</${list.type}>`);
      list = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length; // 2 or 3
      blocks.push(`<h${level}>${applyInlineFormatting(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.join("\n");
}

/** Plain-text excerpt for meta descriptions / card previews. */
export function markdownToExcerpt(markdown: string, maxLength = 160): string {
  const plain = markdown
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>-]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}
