import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Message } from "@/models/Message"

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer", "client"])
    const { id } = await params

    await connectDB()

    const message = await Message.findById(id).lean()
    if (!message) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 }
      )
    }

    if (message.receiverId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await Message.findByIdAndUpdate(id, { read: true })

    return NextResponse.json({ success: true })
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
