import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ProgressiveOverloadPlan } from "@/models/ProgressiveOverloadPlan"
import { OverloadSuggestion } from "@/models/OverloadSuggestion"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"
import { generateSuggestions } from "@/lib/overload-suggestions"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    const { searchParams } = new URL(request.url)
    const status = (searchParams.get("status") || "pending") as
      | "pending"
      | "approved"
      | "denied"
      | "applied"

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

    const suggestions = await OverloadSuggestion.find({
      planId: id,
      status,
    })
      .populate("exerciseId", "name category muscleGroups")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ suggestions })
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

export async function POST(
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

    const created = await generateSuggestions(
      plan.clientRoutineId.toString()
    )

    return NextResponse.json({
      message: `${created.length} suggestion(s) generated.`,
      count: created.length,
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
