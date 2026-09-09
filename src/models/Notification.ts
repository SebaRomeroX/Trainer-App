import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "message" | "feedback" | "routine_assigned" | "routine_adjusted" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "feedback", "routine_assigned", "routine_adjusted", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
