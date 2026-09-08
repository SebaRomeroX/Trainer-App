import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Feedback } from "@/models/Feedback"
import { ClientProfile } from "@/models/ClientProfile"
import { CreateFeedbackSchema } from "@/validators/feedback"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["client", "trainer"])

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
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
    const body = await request.json()
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
