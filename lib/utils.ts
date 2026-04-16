import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeSlug(title: string) {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeExcerpt(excerpt: string, content: string, fallbackLength = 150, maxLength = 180) {
  const trimmedExcerpt = stripHtml(excerpt).trim();

  if (trimmedExcerpt && trimmedExcerpt.length <= maxLength) {
    return trimmedExcerpt.slice(0, maxLength);
  }

  const plainContent = stripHtml(content);
  return plainContent.slice(0, Math.min(fallbackLength, maxLength)).trim();
}

export function makeExcerpt(content: string, maxLength = 180) {
  const plain = stripHtml(content);
  return plain.slice(0, maxLength).trim();
}

export function getReadTimeMinutes(content: string) {
  const plain = stripHtml(content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
}
