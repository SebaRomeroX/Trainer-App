import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITrainerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bio?: string;
  specialties: string[];
  maxClients: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerProfileSchema = new Schema<ITrainerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String },
    specialties: [{ type: String }],
    maxClients: { type: Number, default: 50 },
  },
  { timestamps: true }
);

TrainerProfileSchema.index({ userId: 1 });

export const TrainerProfile: Model<ITrainerProfile> =
  mongoose.models.TrainerProfile ||
  mongoose.model<ITrainerProfile>("TrainerProfile", TrainerProfileSchema);
