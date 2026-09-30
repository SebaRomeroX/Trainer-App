import { describe, it, expect } from "vitest"
import { generateRandomPassword } from "@/lib/password"

describe("generateRandomPassword", () => {
  it("generates a password with the default length", () => {
    expect(generateRandomPassword()).toHaveLength(12)
  })

  it("respects a custom length but never goes below the policy minimum", () => {
    expect(generateRandomPassword(16)).toHaveLength(16)
    expect(generateRandomPassword(4)).toHaveLength(8)
  })

  it("always satisfies the app password policy (letter + number)", () => {
    for (let i = 0; i < 200; i++) {
      const password = generateRandomPassword()
      expect(password).toMatch(/[a-zA-Z]/)
      expect(password).toMatch(/[0-9]/)
    }
  })

  it("generates unique passwords", () => {
    const passwords = new Set(
      Array.from({ length: 100 }, () => generateRandomPassword())
    )
    expect(passwords.size).toBe(100)
  })
})
