import { describe, it, expect } from "vitest"
import { sanitizeStrict, sanitizeModerate, sanitizeArray } from "@/lib/sanitize"

describe("sanitizeStrict", () => {
  it("removes HTML tags and script content", () => {
    expect(sanitizeStrict("<script>alert('xss')</script>")).toBe("")
  })

  it("removes nested HTML tags", () => {
    expect(sanitizeStrict("<div><b>bold</b></div>")).toBe("bold")
  })

  it("preserves plain text", () => {
    expect(sanitizeStrict("Hello world")).toBe("Hello world")
  })

  it("trims whitespace", () => {
    expect(sanitizeStrict("  hello  ")).toBe("hello")
  })

  it("handles empty string", () => {
    expect(sanitizeStrict("")).toBe("")
  })

  it("removes img tags with event handlers", () => {
    expect(
      sanitizeStrict('<img src="x" onerror="alert(1)">')
    ).not.toContain("onerror")
  })
})

describe("sanitizeModerate", () => {
  it("allows basic formatting tags", () => {
    expect(sanitizeModerate("<b>bold</b>")).toBe("<b>bold</b>")
  })

  it("allows paragraph tags", () => {
    expect(sanitizeModerate("<p>text</p>")).toBe("<p>text</p>")
  })

  it("removes script tags", () => {
    expect(sanitizeModerate("<script>alert(1)</script>")).not.toContain(
      "<script>"
    )
  })

  it("removes disallowed tags like div", () => {
    expect(sanitizeModerate("<div>content</div>")).toBe("content")
  })
})

describe("sanitizeArray", () => {
  it("sanitizes each item in array", () => {
    const input = ["<b>clean</b>", "normal", "<script>bad</script>"]
    const result = sanitizeArray(input)
    expect(result).toEqual(["clean", "normal", ""])
  })

  it("handles empty array", () => {
    expect(sanitizeArray([])).toEqual([])
  })
})
