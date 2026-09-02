import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  workoutLogId?: mongoose.Types.ObjectId;
  type: "client_to_trainer" | "trainer_to_client";
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workoutLogId: { type: Schema.Types.ObjectId, ref: "WorkoutLog" },
    type: {
      type: String,
      enum: ["client_to_trainer", "trainer_to_client"],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FeedbackSchema.index({ clientId: 1, trainerId: 1 });
FeedbackSchema.index({ read: 1 });

export const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
