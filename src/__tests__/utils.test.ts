import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "text-blue-500")
    expect(result).toBe("text-blue-500")
  })

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra")
    expect(result).toContain("base")
    expect(result).toContain("extra")
    expect(result).not.toContain("hidden")
  })

  it("merges tailwind classes correctly", () => {
    const result = cn("p-4", "p-8")
    expect(result).toBe("p-8")
  })

  it("handles empty input", () => {
    expect(cn()).toBe("")
  })
})
