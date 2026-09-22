import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { User } from "@/models/User"
import { TrainerProfile } from "@/models/TrainerProfile"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params

    await connectDB()

    const user = await User.findById(id).select("role isAdmin").lean()
    if (!user) {
      return NextResponse.json({ error: "Trainer not found." }, { status: 404 })
    }

    if (user.role !== "trainer") {
      return NextResponse.json({ error: "User is not a trainer." }, { status: 400 })
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { error: "Cannot delete the admin trainer." },
        { status: 403 }
      )
    }

    // Prevent trainers from deleting other trainers (only self-delete or admin)
    if (session.userId !== id && !session.isAdmin) {
      return NextResponse.json(
        { error: "You can only remove your own account." },
        { status: 403 }
      )
    }

    await TrainerProfile.findOneAndDelete({ userId: id })
    await User.findByIdAndDelete(id)

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
