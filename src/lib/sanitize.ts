import sanitizeHtml from "sanitize-html"

const STRICT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
}

const MODERATE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["b", "i", "em", "strong", "p", "br"],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
}

export function sanitizeStrict(input: string): string {
  return sanitizeHtml(input, STRICT_OPTIONS).trim()
}

export function sanitizeModerate(input: string): string {
  return sanitizeHtml(input, MODERATE_OPTIONS).trim()
}

export function sanitizeArray(items: string[]): string[] {
  return items.map(sanitizeStrict)
}
