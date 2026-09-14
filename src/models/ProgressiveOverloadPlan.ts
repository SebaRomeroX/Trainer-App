import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IPlanExercise {
  exerciseId: mongoose.Types.ObjectId
  targetWeight?: number
  targetReps?: number
  targetSets?: number
  targetDate: Date
  notes?: string
}

export interface IProgressiveOverloadPlan extends Document {
  _id: mongoose.Types.ObjectId
  clientRoutineId: mongoose.Types.ObjectId
  trainerId: mongoose.Types.ObjectId
  exercises: IPlanExercise[]
  lastSuggestionCheck?: Date
  status: "active" | "completed" | "archived"
  createdAt: Date
  updatedAt: Date
}

const PlanExerciseSchema = new Schema<IPlanExercise>(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    targetWeight: { type: Number },
    targetReps: { type: Number },
    targetSets: { type: Number },
    targetDate: { type: Date, required: true },
    notes: { type: String, maxlength: 200 },
  },
  { _id: false }
)

const ProgressiveOverloadPlanSchema =
  new Schema<IProgressiveOverloadPlan>(
    {
      clientRoutineId: {
        type: Schema.Types.ObjectId,
        ref: "ClientRoutine",
        required: true,
        unique: true,
      },
      trainerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      exercises: {
        type: [PlanExerciseSchema],
        validate: {
          validator: (v: IPlanExercise[]) => v.length > 0,
          message: "At least one exercise target is required.",
        },
      },
      lastSuggestionCheck: { type: Date },
      status: {
        type: String,
        enum: ["active", "completed", "archived"],
        default: "active",
      },
    },
    { timestamps: true }
  )

ProgressiveOverloadPlanSchema.index({ trainerId: 1, status: 1 })

export const ProgressiveOverloadPlan: Model<IProgressiveOverloadPlan> =
  mongoose.models.ProgressiveOverloadPlan ||
  mongoose.model<IProgressiveOverloadPlan>(
    "ProgressiveOverloadPlan",
    ProgressiveOverloadPlanSchema
  )
