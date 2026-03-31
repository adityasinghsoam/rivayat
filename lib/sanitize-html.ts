import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "h1",
      "h2",
      "h3",
      "blockquote",
    ],
    allowedAttributes: {},
  });
}
