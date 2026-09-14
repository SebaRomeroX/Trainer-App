import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { OverloadSuggestion } from "@/models/OverloadSuggestion"
import { ProgressiveOverloadPlan } from "@/models/ProgressiveOverloadPlan"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"
import { Routine } from "@/models/Routine"
import { ResolveSuggestionSchema } from "@/validators/progressive-overload"
import { logRoutineChange } from "@/lib/routine-changes"

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
    const validated = ResolveSuggestionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const suggestion = await OverloadSuggestion.findById(id).lean()

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found." },
        { status: 404 }
      )
    }

    if (suggestion.status !== "pending") {
      return NextResponse.json(
        { error: "This suggestion has already been resolved." },
        { status: 400 }
      )
    }

    const plan = await ProgressiveOverloadPlan.findById(
      suggestion.planId
    ).lean()

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

    if (validated.data.action === "approved") {
      const routine = await Routine.findById(assignment.routineId).lean()

      if (routine) {
        const exerciseIndex = routine.exercises.findIndex(
          (e) =>
            e.exerciseId.toString() === suggestion.exerciseId.toString()
        )

        if (exerciseIndex !== -1) {
          const exerciseUpdate: Record<string, unknown> = {}
          const weight =
            validated.data.customWeight ?? suggestion.suggestedWeight
          const reps = validated.data.customReps ?? suggestion.suggestedReps
          const sets = validated.data.customSets ?? suggestion.suggestedSets

          if (weight !== undefined) exerciseUpdate.weight = weight
          if (reps !== undefined) exerciseUpdate.reps = reps
          if (sets !== undefined) exerciseUpdate.sets = sets

          const updatePath = `exercises.${exerciseIndex}`
          await Routine.findByIdAndUpdate(assignment.routineId, {
            $set: { [updatePath]: { ...routine.exercises[exerciseIndex], ...exerciseUpdate } },
          })

          const changes = Object.entries(exerciseUpdate).map(
            ([field, after]) => ({
              field: `${routine.exercises[exerciseIndex].exerciseId}.${field}`,
              before: routine.exercises[exerciseIndex][
                field as keyof (typeof routine.exercises)[0]
              ],
              after,
            })
          )

          logRoutineChange({
            routineId: assignment.routineId.toString(),
            clientId: assignment.clientId.toString(),
            trainerId: session.userId,
            changeType: "overload_adjustment",
            description: `Progressive overload applied to exercise`,
            changes,
          }).catch(console.error)
        }
      }
    }

    await OverloadSuggestion.findByIdAndUpdate(id, {
      status: validated.data.action,
      resolvedAt: new Date(),
    })

    return NextResponse.json({
      message: `Suggestion ${validated.data.action}.`,
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
