import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientRoutine extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  routineId: mongoose.Types.ObjectId;
  assignedDate: Date;
  startDate: Date;
  endDate?: Date;
  status: "active" | "scheduled" | "completed" | "paused";
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClientRoutineSchema = new Schema<IClientRoutine>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routineId: {
      type: Schema.Types.ObjectId,
      ref: "Routine",
      required: true,
    },
    assignedDate: { type: Date, default: Date.now },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "scheduled", "completed", "paused"],
      default: "active",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

ClientRoutineSchema.index({ clientId: 1, status: 1 });
ClientRoutineSchema.index({ routineId: 1 });

export const ClientRoutine: Model<IClientRoutine> =
  mongoose.models.ClientRoutine ||
  mongoose.model<IClientRoutine>("ClientRoutine", ClientRoutineSchema);
