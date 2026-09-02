import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { Routine } from "@/models/Routine"
import { CreateRoutineSchema } from "@/validators/routine"

export async function GET() {
  try {
    const session = await requireRole(["trainer"])

    await connectDB()

    const routines = await Routine.find({ trainerId: session.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ routines })
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
    const validated = CreateRoutineSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const routine = await Routine.create({
      trainerId: session.userId,
      ...validated.data,
    })

    return NextResponse.json({ routine }, { status: 201 })
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
