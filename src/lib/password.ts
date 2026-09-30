import "server-only"
import { randomInt } from "crypto"

const LOWER = "abcdefghijkmnopqrstuvwxyz"
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const DIGITS = "23456789"
const SPECIAL = "!@#$%^&*?-_=+"
const ALL = LOWER + UPPER + DIGITS + SPECIAL

function randomChar(chars: string): string {
  return chars[randomInt(chars.length)]
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

/**
 * Generates a random password that always satisfies the app's password
 * policy (at least 8 characters, one letter, one number).
 */
export function generateRandomPassword(length = 12): string {
  const size = Math.max(length, 8)
  const chars: string[] = [
    randomChar(LOWER),
    randomChar(UPPER),
    randomChar(DIGITS),
    randomChar(SPECIAL),
  ]
  while (chars.length < size) {
    chars.push(randomChar(ALL))
  }
  return shuffle(chars).join("")
}
