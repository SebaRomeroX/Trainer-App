import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ProgressiveOverloadPlan } from "@/models/ProgressiveOverloadPlan"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"
import { CreatePlanSchema } from "@/validators/progressive-overload"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["trainer"])
    const { searchParams } = new URL(request.url)
    const clientRoutineId = searchParams.get("clientRoutineId")

    if (!clientRoutineId) {
      return NextResponse.json(
        { error: "clientRoutineId query parameter is required." },
        { status: 400 }
      )
    }

    const invalid = validateObjectId(clientRoutineId)
    if (invalid) return invalid

    await connectDB()

    const assignment = await ClientRoutine.findById(clientRoutineId).lean()
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      )
    }

    const clientProfile = await ClientProfile.findOne({
      userId: assignment.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const plan = await ProgressiveOverloadPlan.findOne({
      clientRoutineId,
      status: { $in: ["active", "completed"] },
    })
      .populate("exercises.exerciseId", "name category muscleGroups")
      .lean()

    return NextResponse.json({ plan: plan || null })
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
    const session = await requireRole(["trainer"])
    const body = await request.json()
    const validated = CreatePlanSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const assignment = await ClientRoutine.findById(
      validated.data.clientRoutineId
    ).lean()

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      )
    }

    const clientProfile = await ClientProfile.findOne({
      userId: assignment.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existing = await ProgressiveOverloadPlan.findOne({
      clientRoutineId: validated.data.clientRoutineId,
      status: "active",
    }).lean()

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A plan already exists for this assignment. Update or archive it first.",
        },
        { status: 409 }
      )
    }

    const plan = await ProgressiveOverloadPlan.create({
      clientRoutineId: validated.data.clientRoutineId,
      trainerId: session.userId,
      exercises: validated.data.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        targetWeight: e.targetWeight,
        targetReps: e.targetReps,
        targetSets: e.targetSets,
        targetDate: new Date(e.targetDate),
        notes: e.notes,
      })),
    })

    return NextResponse.json({ plan }, { status: 201 })
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
