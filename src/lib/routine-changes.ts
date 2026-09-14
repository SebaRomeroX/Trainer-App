import { connectDB } from "@/lib/db"
import { RoutineChangeLog } from "@/models/RoutineChangeLog"

interface LogChange {
  field: string
  before: unknown
  after: unknown
}

interface LogRoutineChangeParams {
  routineId: string
  clientId?: string
  trainerId: string
  changeType:
    | "routine_updated"
    | "assigned"
    | "unassigned"
    | "status_changed"
    | "overload_adjustment"
  description: string
  changes?: LogChange[]
}

export async function logRoutineChange(params: LogRoutineChangeParams) {
  await connectDB()
  await RoutineChangeLog.create({
    routineId: params.routineId,
    clientId: params.clientId,
    trainerId: params.trainerId,
    changeType: params.changeType,
    description: params.description,
    changes: params.changes,
  })
}
