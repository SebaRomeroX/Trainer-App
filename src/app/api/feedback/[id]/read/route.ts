import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Feedback } from "@/models/Feedback"

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["client", "trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    await connectDB()

    const feedback = await Feedback.findById(id).lean()

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found." },
        { status: 404 }
      )
    }

    if (
      session.role === "client" &&
      feedback.clientId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.role === "trainer" && feedback.trainerId.toString() !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await Feedback.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    ).lean()

    return NextResponse.json({ feedback: updated })
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
