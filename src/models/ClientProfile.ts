import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  trainerId?: mongoose.Types.ObjectId;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  notes?: string;
  startDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "User" },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goals: [{ type: String }],
    notes: { type: String },
    startDate: { type: Date },
  },
  { timestamps: true }
);

ClientProfileSchema.index({ userId: 1 });
ClientProfileSchema.index({ trainerId: 1 });

export const ClientProfile: Model<IClientProfile> =
  mongoose.models.ClientProfile ||
  mongoose.model<IClientProfile>("ClientProfile", ClientProfileSchema);
