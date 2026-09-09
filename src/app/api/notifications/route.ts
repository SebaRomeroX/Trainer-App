import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Notification } from "@/models/Notification"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["trainer", "client"])

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20))
    const skip = (page - 1) * limit

    await connectDB()

    const filter = { userId: session.userId }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, read: false }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
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
