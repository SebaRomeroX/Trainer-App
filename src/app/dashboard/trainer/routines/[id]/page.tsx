import { notFound } from "next/navigation"
import { RoutineEditClient } from "@/components/routines/routine-edit-client"
import { connectDB } from "@/lib/db"
import { Routine } from "@/models/Routine"
import { verifySession } from "@/lib/dal"

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) return notFound()

  const { id } = await params

  await connectDB()

  const routine = await Routine.findOne({
    _id: id,
    trainerId: session.userId,
  })
    .populate("exercises.exerciseId", "name")
    .lean()

  if (!routine) return notFound()

  const serialized = JSON.parse(JSON.stringify(routine))

  return <RoutineEditClient routineId={id} routine={serialized} />
}
