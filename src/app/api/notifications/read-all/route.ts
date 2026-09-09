import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Notification } from "@/models/Notification"

export async function PUT() {
  try {
    const session = await requireRole(["trainer", "client"])

    await connectDB()

    await Notification.updateMany(
      { userId: session.userId, read: false },
      { read: true }
    )

    return NextResponse.json({ message: "All notifications marked as read." })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
