import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Notification } from "@/models/Notification"

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer", "client"])
    const { id } = await params

    await connectDB()

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { read: true },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
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
