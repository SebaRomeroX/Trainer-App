import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoutineExercise {
  exerciseId: mongoose.Types.ObjectId;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime: number;
  notes?: string;
  order: number;
}

export interface IRoutine extends Document {
  _id: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  exercises: IRoutineExercise[];
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineExerciseSchema = new Schema<IRoutineExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    sets: { type: Number },
    reps: { type: Number },
    duration: { type: Number },
    restTime: { type: Number, default: 60 },
    notes: { type: String },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const RoutineSchema = new Schema<IRoutine>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    duration: { type: Number, required: true },
    exercises: [RoutineExerciseSchema],
    isTemplate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RoutineSchema.index({ trainerId: 1 });

export const Routine: Model<IRoutine> =
  mongoose.models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema);
