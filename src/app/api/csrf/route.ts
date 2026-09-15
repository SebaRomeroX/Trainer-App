import { NextResponse } from "next/server"
import { generateCsrfToken } from "@/lib/csrf"

export async function GET() {
  try {
    const token = await generateCsrfToken()
    return NextResponse.json({ csrfToken: token })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    )
  }
}
