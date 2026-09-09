import { connectDB } from "@/lib/db"
import { Notification, INotification } from "@/models/Notification"

type NotificationType = INotification["type"]

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}): Promise<void> {
  await connectDB()
  await Notification.create({ userId, type, title, message, link })
}
