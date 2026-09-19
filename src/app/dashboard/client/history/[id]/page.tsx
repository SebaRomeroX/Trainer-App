import { notFound } from "next/navigation"
import { WorkoutLogDetailClient } from "@/components/workouts/workout-log-detail"
import { connectDB } from "@/lib/db"
import { WorkoutLog } from "@/models/WorkoutLog"
import { verifySession } from "@/lib/dal"

export default async function WorkoutLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) return notFound()

  const { id } = await params

  await connectDB()

  const log = await WorkoutLog.findOne({
    _id: id,
    clientId: session.userId,
  })
    .populate("exercises.exerciseId", "name category")
    .populate("routineId", "name difficulty")
    .lean()

  if (!log) return notFound()

  const serialized = JSON.parse(JSON.stringify(log))

  return <WorkoutLogDetailClient log={serialized} />
}
