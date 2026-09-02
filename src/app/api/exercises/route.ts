import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { Exercise } from "@/models/Exercise"
import { CreateExerciseSchema } from "@/validators/exercise"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["trainer"])

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const difficulty = searchParams.get("difficulty") || ""

    await connectDB()

    const filter: Record<string, unknown> = { trainerId: session.userId }

    if (category) {
      filter.category = category
    }

    if (difficulty) {
      filter.difficulty = difficulty
    }

    if (search) {
      filter.$text = { $search: search }
    }

    const exercises = await Exercise.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ exercises })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["trainer"])
    const body = await request.json()
    const validated = CreateExerciseSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const exercise = await Exercise.create({
      trainerId: session.userId,
      ...validated.data,
    })

    return NextResponse.json({ exercise }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
