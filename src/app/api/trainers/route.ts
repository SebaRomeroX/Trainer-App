import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { User } from "@/models/User"
import { TrainerProfile } from "@/models/TrainerProfile"
import { hashPassword } from "@/lib/auth"
import { CreateTrainerSchema } from "@/validators/trainer"

export async function GET() {
  try {
    await requireRole(["trainer"])

    await connectDB()

    const trainerUsers = await User.find({ role: "trainer" })
      .select("name email avatar createdAt isAdmin")
      .sort({ createdAt: -1 })
      .lean()

    const trainerIds = trainerUsers.map((u) => u._id)
    const profiles = await TrainerProfile.find({ userId: { $in: trainerIds } })
      .lean()

    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    )

    const trainers = trainerUsers.map((user) => {
      const profile = profileMap.get(user._id.toString())
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin ?? false,
        bio: profile?.bio ?? "",
        specialties: profile?.specialties ?? [],
        createdAt: user.createdAt,
      }
    })

    return NextResponse.json({ trainers })
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
    const session = await requireRole(["trainer"])
    const body = await request.json()
    const validated = CreateTrainerSchema.safeParse(body)

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

    const tempPassword = crypto.randomUUID()
    const hashedPassword = await hashPassword(tempPassword)

    const user = await User.create({
      name: validated.data.name,
      email: validated.data.email,
      password: hashedPassword,
      role: "trainer",
    })

    let trainerProfile
    try {
      trainerProfile = await TrainerProfile.create({
        userId: user._id,
        bio: validated.data.bio,
        specialties: validated.data.specialties,
      })
    } catch (profileError) {
      await User.findByIdAndDelete(user._id)
      throw profileError
    }

    return NextResponse.json(
      {
        trainer: {
          _id: trainerProfile._id.toString(),
          name: user.name,
          email: user.email,
          bio: trainerProfile.bio,
          specialties: trainerProfile.specialties,
          isAdmin: false,
        },
        tempPassword,
      },
      { status: 201 }
    )
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
