import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExercise extends Document {
  _id: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: "strength" | "cardio" | "flexibility" | "balance" | "other";
  muscleGroups: string[];
  equipment: string[];
  difficulty: "easy" | "medium" | "hard";
  videoUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "balance", "other"],
      required: true,
    },
    muscleGroups: [{ type: String }],
    equipment: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    videoUrl: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

ExerciseSchema.index({ trainerId: 1 });
ExerciseSchema.index({ category: 1 });
ExerciseSchema.index({ name: "text", description: "text" });

export const Exercise: Model<IExercise> =
  mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", ExerciseSchema);
