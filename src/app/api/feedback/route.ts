import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Feedback } from "@/models/Feedback"
import { ClientProfile } from "@/models/ClientProfile"
import { User } from "@/models/User"
import { CreateFeedbackSchema } from "@/validators/feedback"
import { createNotification } from "@/lib/notifications"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["client", "trainer"])

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20))
    const skip = (page - 1) * limit

    await connectDB()

    const filter: Record<string, unknown> = {}

    if (session.role === "client") {
      filter.clientId = session.userId
      filter.type = "client_to_trainer"
    } else {
      const clientIds = await ClientProfile.find({ trainerId: session.userId })
        .select("userId")
        .lean()
        .then((profiles) => profiles.map((p) => p.userId))
      filter.clientId = { $in: clientIds }
      filter.type = "client_to_trainer"
    }

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("clientId", "name email")
        .lean(),
      Feedback.countDocuments(filter),
    ])

    return NextResponse.json({
      feedbacks,
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

export async function POST(request: Request) {
  try {
    const session = await requireRole(["client"])

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const validated = CreateFeedbackSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const profile = await ClientProfile.findOne({
      userId: session.userId,
    }).lean()

    if (!profile?.trainerId) {
      return NextResponse.json(
        { error: "No trainer assigned." },
        { status: 400 }
      )
    }

    const feedback = await Feedback.create({
      clientId: session.userId,
      trainerId: profile.trainerId,
      type: "client_to_trainer",
      ...validated.data,
    })

    const client = await User.findById(session.userId).select("name").lean()
    const clientName = client?.name || "A client"

    createNotification({
      userId: profile.trainerId.toString(),
      type: "feedback",
      title: `Feedback from ${clientName}`,
      message: `Difficulty: ${validated.data.difficultyRating}/5, Enjoyment: ${validated.data.enjoymentRating}/5`,
      link: "/dashboard/trainer/clients",
    }).catch(console.error)

    return NextResponse.json({ feedback }, { status: 201 })
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
