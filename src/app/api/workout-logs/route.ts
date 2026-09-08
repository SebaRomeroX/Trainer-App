import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"
import { ClientRoutine } from "@/models/ClientRoutine"
import { CreateWorkoutLogSchema } from "@/validators/workout-log"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["client"])

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20))
    const skip = (page - 1) * limit

    await connectDB()

    const [logs, total] = await Promise.all([
      WorkoutLog.find({ clientId: session.userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("routineId", "name difficulty")
        .lean(),
      WorkoutLog.countDocuments({ clientId: session.userId }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["client"])
    const body = await request.json()
    const validated = CreateWorkoutLogSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const assignment = await ClientRoutine.findOne({
      clientId: session.userId,
      routineId: validated.data.routineId,
      status: "active",
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "No active assignment found for this routine." },
        { status: 400 }
      )
    }

    const log = await WorkoutLog.create({
      clientId: session.userId,
      ...validated.data,
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
