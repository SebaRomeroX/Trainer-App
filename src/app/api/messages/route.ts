import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Message } from "@/models/Message"
import { ClientProfile } from "@/models/ClientProfile"
import { User } from "@/models/User"
import { SendMessageSchema } from "@/validators/message"

export async function GET(request: Request) {
  try {
    const session = await requireRole(["trainer", "client"])

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50))
    const skip = (page - 1) * limit

    await connectDB()

    let otherUserId = searchParams.get("with")

    if (session.role === "client" && !otherUserId) {
      const profile = await ClientProfile.findOne({ userId: session.userId })
        .select("trainerId")
        .lean()
      if (profile?.trainerId) {
        otherUserId = profile.trainerId.toString()
      }
    }

    if (otherUserId) {
      const messages = await Message.find({
        $or: [
          { senderId: session.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.userId },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name avatar")
        .populate("receiverId", "name avatar")
        .lean()

      return NextResponse.json({ messages: messages.reverse() })
    }

    if (session.role === "trainer") {
      const clientProfiles = await ClientProfile.find({ trainerId: session.userId })
        .select("userId")
        .lean()

      const clientUserIds = clientProfiles.map((p) => p.userId)

      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { senderId: session.userId, receiverId: { $in: clientUserIds } },
              { senderId: { $in: clientUserIds }, receiverId: session.userId },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", session.userId] },
                "$receiverId",
                "$senderId",
              ],
            },
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$receiverId", session.userId] },
                      { $eq: ["$read", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { "lastMessage.createdAt": -1 } },
      ])

      const userIds = conversations.map((c) => c._id)
      const users = await User.find({ _id: { $in: userIds } })
        .select("name avatar")
        .lean()

      const userMap = new Map(users.map((u) => [u._id.toString(), u]))

      const result = conversations.map((c) => ({
        userId: c._id.toString(),
        user: userMap.get(c._id.toString()) || { name: "Unknown", avatar: null },
        lastMessage: {
          content: c.lastMessage.content,
          createdAt: c.lastMessage.createdAt,
          isMine: c.lastMessage.senderId.toString() === session.userId,
        },
        unreadCount: c.unreadCount,
      }))

      return NextResponse.json({ conversations: result })
    }

    return NextResponse.json({ conversations: [] })
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
    const session = await requireRole(["trainer", "client"])

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const validated = SendMessageSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const receiver = await User.findById(validated.data.receiverId).lean()
    if (!receiver) {
      return NextResponse.json(
        { error: "Recipient not found." },
        { status: 404 }
      )
    }

    if (session.role === "trainer") {
      const clientProfile = await ClientProfile.findOne({
        userId: validated.data.receiverId,
        trainerId: session.userId,
      }).lean()
      if (!clientProfile) {
        return NextResponse.json(
          { error: "You can only message your assigned clients." },
          { status: 403 }
        )
      }
    }

    if (session.role === "client") {
      const profile = await ClientProfile.findOne({ userId: session.userId })
        .lean()
      if (!profile?.trainerId || profile.trainerId.toString() !== validated.data.receiverId) {
        return NextResponse.json(
          { error: "You can only message your trainer." },
          { status: 403 }
        )
      }
    }

    const message = await Message.create({
      senderId: session.userId,
      receiverId: validated.data.receiverId,
      content: validated.data.content,
    })

    return NextResponse.json({ message }, { status: 201 })
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
