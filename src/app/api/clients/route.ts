import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { User } from "@/models/User"
import { ClientProfile } from "@/models/ClientProfile"
import { hashPassword } from "@/lib/auth"
import { CreateClientSchema } from "@/validators/client"

export async function GET() {
  try {
    const session = await requireRole(["trainer"])

    await connectDB()

    const clientProfiles = await ClientProfile.find({ trainerId: session.userId })
      .populate("userId", "name email avatar createdAt")
      .sort({ createdAt: -1 })
      .lean()

    const clients = clientProfiles.map((profile) => ({
      _id: profile._id.toString(),
      userId: (profile.userId as unknown as { _id: { toString(): string }; name: string; email: string; avatar?: string; createdAt: Date }),
      fitnessLevel: profile.fitnessLevel,
      goals: profile.goals,
      notes: profile.notes,
      startDate: profile.startDate,
      createdAt: profile.createdAt,
    }))

    return NextResponse.json({ clients })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["trainer"])
    const body = await request.json()
    const validated = CreateClientSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email: validated.data.email })
    if (existingUser) {
      return NextResponse.json(
        { errors: { email: ["A user with this email already exists."] } },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(validated.data.name)

    const user = await User.create({
      name: validated.data.name,
      email: validated.data.email,
      password: hashedPassword,
      role: "client",
    })

    const clientProfile = await ClientProfile.create({
      userId: user._id,
      trainerId: session.userId,
      fitnessLevel: validated.data.fitnessLevel,
      goals: validated.data.goals,
      notes: validated.data.notes,
      startDate: new Date(),
    })

    return NextResponse.json(
      {
        client: {
          _id: clientProfile._id.toString(),
          userId: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
          },
          fitnessLevel: clientProfile.fitnessLevel,
          goals: clientProfile.goals,
          notes: clientProfile.notes,
          startDate: clientProfile.startDate,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
