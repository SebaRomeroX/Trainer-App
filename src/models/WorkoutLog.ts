import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkoutLogExercise {
  exerciseId: mongoose.Types.ObjectId;
  setsCompleted: number;
  repsCompleted: number[];
  weight?: number;
  duration?: number;
  completed: boolean;
}

export interface IWorkoutLog extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  routineId: mongoose.Types.ObjectId;
  date: Date;
  exercises: IWorkoutLogExercise[];
  notes?: string;
  duration: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutLogExerciseSchema = new Schema<IWorkoutLogExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    setsCompleted: { type: Number, required: true },
    repsCompleted: [{ type: Number }],
    weight: { type: Number },
    duration: { type: Number },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", required: true },
    date: { type: Date, default: Date.now },
    exercises: [WorkoutLogExerciseSchema],
    notes: { type: String },
    duration: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

WorkoutLogSchema.index({ clientId: 1, date: -1 });
WorkoutLogSchema.index({ routineId: 1 });

export const WorkoutLog: Model<IWorkoutLog> =
  mongoose.models.WorkoutLog ||
  mongoose.model<IWorkoutLog>("WorkoutLog", WorkoutLogSchema);
