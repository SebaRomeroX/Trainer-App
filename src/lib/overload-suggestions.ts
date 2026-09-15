import { connectDB } from "@/lib/db"
import { ProgressiveOverloadPlan } from "@/models/ProgressiveOverloadPlan"
import { OverloadSuggestion } from "@/models/OverloadSuggestion"
import { WorkoutLog } from "@/models/WorkoutLog"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"
import { User } from "@/models/User"
import { createNotification } from "@/lib/notifications"

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface LatestExerciseLog {
  exerciseId: string
  weight?: number
  repsCompleted?: number[]
  setsCompleted?: number
}

async function getLatestLogExercises(
  clientRoutineId: string
): Promise<LatestExerciseLog[]> {
  const assignment = await ClientRoutine.findById(clientRoutineId)
    .select("clientId routineId")
    .lean()

  if (!assignment) return []

  const latestLog = await WorkoutLog.findOne({
    clientId: assignment.clientId,
    routineId: assignment.routineId,
  })
    .sort({ date: -1 })
    .lean()

  if (!latestLog) return []

  return latestLog.exercises.map((e) => ({
    exerciseId: e.exerciseId.toString(),
    weight: e.weight,
    repsCompleted: e.repsCompleted,
    setsCompleted: e.setsCompleted,
  }))
}

function computeSuggestion(
  current: LatestExerciseLog,
  target: {
    targetWeight?: number
    targetReps?: number
    targetSets?: number
  }
): {
  suggestedWeight?: number
  suggestedReps?: number
  suggestedSets?: number
} | null {
  const suggestions: {
    suggestedWeight?: number
    suggestedReps?: number
    suggestedSets?: number
  } = {}

  let hasSuggestion = false

  if (target.targetWeight !== undefined && current.weight !== undefined) {
    if (current.weight < target.targetWeight) {
      const diff = target.targetWeight - current.weight
      suggestions.suggestedWeight =
        diff <= 2.5
          ? target.targetWeight
          : current.weight + Math.ceil(diff / 2 / 2.5) * 2.5
      hasSuggestion = true
    }
  }

  if (target.targetReps !== undefined && current.repsCompleted?.length) {
    const avgReps =
      current.repsCompleted.reduce((a, b) => a + b, 0) /
      current.repsCompleted.length
    if (avgReps < target.targetReps) {
      suggestions.suggestedReps = Math.min(
        Math.round(avgReps + 1),
        target.targetReps
      )
      hasSuggestion = true
    }
  }

  if (target.targetSets !== undefined && current.setsCompleted !== undefined) {
    if (current.setsCompleted < target.targetSets) {
      suggestions.suggestedSets = current.setsCompleted + 1
      hasSuggestion = true
    }
  }

  return hasSuggestion ? suggestions : null
}

export async function generateSuggestions(clientRoutineId: string) {
  await connectDB()

  const plan = await ProgressiveOverloadPlan.findOne({
    clientRoutineId,
    status: "active",
  }).lean()

  if (!plan) return []

  const now = new Date()
  const lastCheck = plan.lastSuggestionCheck
  const shouldCheck = !lastCheck || now.getTime() - lastCheck.getTime() >= SEVEN_DAYS_MS

  if (!shouldCheck) return []

  const latestExercises = await getLatestLogExercises(clientRoutineId)
  if (latestExercises.length === 0) return []

  const exerciseMap = new Map<string, LatestExerciseLog>()
  for (const e of latestExercises) {
    exerciseMap.set(e.exerciseId, e)
  }

  const suggestionsToCreate: Array<{
    planId: string
    clientId: string
    exerciseId: string
    currentWeight?: number
    currentReps?: number
    currentSets?: number
    suggestedWeight?: number
    suggestedReps?: number
    suggestedSets?: number
  }> = []

  const assignment = await ClientRoutine.findById(clientRoutineId)
    .select("clientId")
    .lean()

  if (!assignment) return []

  for (const planExercise of plan.exercises) {
    const exerciseId = planExercise.exerciseId.toString()
    const current = exerciseMap.get(exerciseId)
    if (!current) continue

    const targetDate = new Date(planExercise.targetDate)
    const daysUntilTarget = Math.ceil(
      (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilTarget > 7) continue

    const suggestion = computeSuggestion(current, {
      targetWeight: planExercise.targetWeight,
      targetReps: planExercise.targetReps,
      targetSets: planExercise.targetSets,
    })

    if (!suggestion) continue

    const existing = await OverloadSuggestion.findOne({
      planId: plan._id,
      exerciseId: planExercise.exerciseId,
      status: "pending",
    }).lean()

    if (existing) continue

    suggestionsToCreate.push({
      planId: plan._id!.toString(),
      clientId: assignment.clientId.toString(),
      exerciseId,
      currentWeight: current.weight,
      currentReps: current.repsCompleted?.length
        ? Math.round(
            (current.repsCompleted.reduce((a, b) => a + b, 0) /
              current.repsCompleted.length) *
              10
          ) / 10
        : undefined,
      currentSets: current.setsCompleted,
      suggestedWeight: suggestion.suggestedWeight,
      suggestedReps: suggestion.suggestedReps,
      suggestedSets: suggestion.suggestedSets,
    })
  }

  if (suggestionsToCreate.length > 0) {
    await OverloadSuggestion.insertMany(suggestionsToCreate, {
      ordered: false,
    }).catch((err) => {
      if (err?.code === 11000) return
      throw err
    })

    const client = await User.findById(assignment.clientId)
      .select("name")
      .lean()
    const clientName = client?.name || "A client"

    const trainerId = plan.trainerId.toString()
    createNotification({
      userId: trainerId,
      type: "routine_adjusted",
      title: `Overload suggestions for ${clientName}`,
      message: `${suggestionsToCreate.length} exercise(s) have progression suggestions ready for review.`,
      link: `/dashboard/trainer/clients/${assignment.clientId}`,
    }).catch(console.error)
  }

  await ProgressiveOverloadPlan.findByIdAndUpdate(plan._id, {
    lastSuggestionCheck: now,
  })

  return suggestionsToCreate
}

export async function generateSuggestionsForFeedback(
  clientId: string,
  routineId: string
) {
  await connectDB()

  const assignment = await ClientRoutine.findOne({
    clientId,
    routineId,
    status: "active",
  }).lean()

  if (!assignment) return

  const plan = await ProgressiveOverloadPlan.findOne({
    clientRoutineId: assignment._id,
    status: "active",
  }).lean()

  if (!plan) return

  await ProgressiveOverloadPlan.findByIdAndUpdate(plan._id, {
    lastSuggestionCheck: new Date(0),
  })

  return generateSuggestions(assignment._id!.toString())
}
