import { WorkoutSession } from "@/components/workouts/workout-session"

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const { assignmentId } = await params
  return <WorkoutSession assignmentId={assignmentId} />
}
