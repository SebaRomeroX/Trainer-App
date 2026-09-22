/**
 * Seed script: Creates an admin trainer account if one doesn't exist.
 *
 * Usage: npx tsx src/scripts/seed-admin.ts
 *
 * Environment variables (optional, have defaults):
 *   ADMIN_TRAINER_EMAIL
 *   ADMIN_TRAINER_PASSWORD
 *   ADMIN_TRAINER_NAME
 */

import mongoose from "mongoose"
import { User } from "../models/User"
import { TrainerProfile } from "../models/TrainerProfile"

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is required")
  process.exit(1)
}

const ADMIN_EMAIL = process.env.ADMIN_TRAINER_EMAIL ?? "admin@trainer-app.com"
const ADMIN_PASSWORD = process.env.ADMIN_TRAINER_PASSWORD ?? "changeme123"
const ADMIN_NAME = process.env.ADMIN_TRAINER_NAME ?? "Admin Trainer"

async function seed() {
  await mongoose.connect(MONGODB_URI!)
  console.log("Connected to MongoDB")

  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`Admin trainer already exists (${ADMIN_EMAIL}). Skipping.`)
    await mongoose.disconnect()
    process.exit(0)
  }

  // bcrypt is not available in standalone scripts, use mongoose middleware or hash manually
  const bcrypt = await import("bcryptjs")
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const user = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "trainer",
    isAdmin: true,
  })

  await TrainerProfile.create({
    userId: user._id,
    bio: "System administrator",
    specialties: [],
  })

  console.log(`\nAdmin trainer created:`)
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log(`\n⚠️  Change the default password after first login!`)

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
