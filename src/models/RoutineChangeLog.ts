import mongoose, { Schema, type Document } from "mongoose"

export interface IRoutineChangeLog extends Document {
  _id: mongoose.Types.ObjectId
  routineId: mongoose.Types.ObjectId
  clientId?: mongoose.Types.ObjectId
  trainerId: mongoose.Types.ObjectId
  changeType:
    | "routine_updated"
    | "assigned"
    | "unassigned"
    | "status_changed"
  description: string
  changes?: {
    field: string
    before: unknown
    after: unknown
  }[]
  createdAt: Date
}

const RoutineChangeLogSchema = new Schema<IRoutineChangeLog>(
  {
    routineId: {
      type: Schema.Types.ObjectId,
      ref: "Routine",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changeType: {
      type: String,
      enum: [
        "routine_updated",
        "assigned",
        "unassigned",
        "status_changed",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    changes: [
      {
        field: { type: String, required: true },
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

RoutineChangeLogSchema.index({ routineId: 1, createdAt: -1 })
RoutineChangeLogSchema.index({ clientId: 1, createdAt: -1 })

export const RoutineChangeLog =
  mongoose.models.RoutineChangeLog ||
  mongoose.model<IRoutineChangeLog>(
    "RoutineChangeLog",
    RoutineChangeLogSchema
  )
