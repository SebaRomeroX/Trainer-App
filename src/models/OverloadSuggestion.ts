import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IOverloadSuggestion extends Document {
  _id: mongoose.Types.ObjectId
  planId: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  exerciseId: mongoose.Types.ObjectId
  currentWeight?: number
  currentReps?: number
  currentSets?: number
  suggestedWeight?: number
  suggestedReps?: number
  suggestedSets?: number
  status: "pending" | "approved" | "denied" | "applied"
  resolvedAt?: Date
  createdAt: Date
}

const OverloadSuggestionSchema = new Schema<IOverloadSuggestion>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "ProgressiveOverloadPlan",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    currentWeight: { type: Number },
    currentReps: { type: Number },
    currentSets: { type: Number },
    suggestedWeight: { type: Number },
    suggestedReps: { type: Number },
    suggestedSets: { type: Number },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "applied"],
      default: "pending",
    },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

OverloadSuggestionSchema.index({ planId: 1, status: 1 })
OverloadSuggestionSchema.index({ clientId: 1, status: 1 })
OverloadSuggestionSchema.index(
  { planId: 1, exerciseId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
)

export const OverloadSuggestion: Model<IOverloadSuggestion> =
  mongoose.models.OverloadSuggestion ||
  mongoose.model<IOverloadSuggestion>(
    "OverloadSuggestion",
    OverloadSuggestionSchema
  )
