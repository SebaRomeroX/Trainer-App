import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ProgressiveOverloadPlan } from "@/models/ProgressiveOverloadPlan"
import { ClientProfile } from "@/models/ClientProfile"
import { ClientRoutine } from "@/models/ClientRoutine"
import { UpdatePlanSchema } from "@/validators/progressive-overload"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    await connectDB()

    const plan = await ProgressiveOverloadPlan.findById(id)
      .populate("exercises.exerciseId", "name category muscleGroups")
      .lean()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 })
    }

    const assignment = await ClientRoutine.findById(
      plan.clientRoutineId
    ).lean()

    if (!assignment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const clientProfile = await ClientProfile.findOne({
      userId: assignment.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ plan })
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    const body = await request.json()
    const validated = UpdatePlanSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const plan = await ProgressiveOverloadPlan.findById(id).lean()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 })
    }

    const assignment = await ClientRoutine.findById(
      plan.clientRoutineId
    ).lean()

    if (!assignment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const clientProfile = await ClientProfile.findOne({
      userId: assignment.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (validated.data.exercises) {
      updateData.exercises = validated.data.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        targetWeight: e.targetWeight,
        targetReps: e.targetReps,
        targetSets: e.targetSets,
        targetDate: new Date(e.targetDate),
        notes: e.notes,
      }))
    }
    if (validated.data.status) {
      updateData.status = validated.data.status
    }

    const updated = await ProgressiveOverloadPlan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("exercises.exerciseId", "name category muscleGroups")
      .lean()

    return NextResponse.json({ plan: updated })
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    await connectDB()

    const plan = await ProgressiveOverloadPlan.findById(id).lean()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 })
    }

    const assignment = await ClientRoutine.findById(
      plan.clientRoutineId
    ).lean()

    if (!assignment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const clientProfile = await ClientProfile.findOne({
      userId: assignment.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await ProgressiveOverloadPlan.findByIdAndUpdate(id, {
      status: "archived",
    })

    return NextResponse.json({ message: "Plan archived." })
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
