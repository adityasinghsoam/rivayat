import sanitizeHtml from "sanitize-html";

const SAFE_LINK_SCHEMES = new Set(["http:", "https:", "mailto:"]);
const SAFE_IMAGE_SCHEMES = new Set(["http:", "https:"]);
const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  colon: ":",
  tab: "\t",
  newline: "\n",
};

function decodeHtmlEntities(input: string) {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (match, entity: string) => {
    const value = entity.toLowerCase();

    if (value.startsWith("#x")) {
      const codePoint = Number.parseInt(value.slice(2), 16);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    if (value.startsWith("#")) {
      const codePoint = Number.parseInt(value.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    return NAMED_HTML_ENTITIES[value] ?? match;
  });
}

function decodePercentEncoding(input: string) {
  let decoded = input;

  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      break;
    }
  }

  return decoded;
}

function normalizeUrlCandidate(input: string) {
  return decodePercentEncoding(decodeHtmlEntities(input))
    .trim()
    .replace(/[\u0000-\u001F\u007F\s]+/g, "");
}

function isSafeUrl(input: string | undefined, safeSchemes: Set<string>) {
  if (!input) {
    return false;
  }

  const normalized = normalizeUrlCandidate(input);
  if (!normalized) {
    return false;
  }

  const blockedSchemePattern = /^(?:javascript|data|vbscript):/i;
  if (blockedSchemePattern.test(normalized)) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    return safeSchemes.has(parsed.protocol.toLowerCase());
  } catch {
    return false;
  }
}

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
      "h4",
      "h5",
      "h6",
      "blockquote",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      code: ["class"],
    },
    allowedClasses: {
      code: [/^language-[a-z0-9-]+$/i],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => {
        const href = isSafeUrl(attribs.href, SAFE_LINK_SCHEMES) ? normalizeUrlCandidate(attribs.href ?? "") : undefined;
        return {
          tagName: "a",
          attribs: href
            ? {
                href,
                target: "_blank",
                rel: "noopener noreferrer",
              }
            : {},
        };
      },
      img: (_tagName, attribs) => {
        const src = isSafeUrl(attribs.src, SAFE_IMAGE_SCHEMES) ? normalizeUrlCandidate(attribs.src ?? "") : undefined;
        const alt = typeof attribs.alt === "string" ? decodeHtmlEntities(attribs.alt).slice(0, 300) : "";

        return {
          tagName: "img",
          attribs: src
            ? {
                src,
                alt,
              }
            : {},
        };
      },
    },
    exclusiveFilter(frame) {
      if (frame.tag === "a") {
        return !frame.attribs.href;
      }

      if (frame.tag === "img") {
        return !frame.attribs.src;
      }

      return false;
    },
  });
}
