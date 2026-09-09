"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Star,
  Dumbbell,
  Shuffle,
  Info,
} from "lucide-react"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

const typeIcons: Record<string, typeof MessageSquare> = {
  message: MessageSquare,
  feedback: Star,
  routine_assigned: Dumbbell,
  routine_adjusted: Shuffle,
  system: Info,
}

const typeColors: Record<string, string> = {
  message: "text-blue-500",
  feedback: "text-yellow-500",
  routine_assigned: "text-green-500",
  routine_adjusted: "text-purple-500",
  system: "text-zinc-500",
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Info
  const iconColor = typeColors[notification.type] || "text-zinc-500"

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900",
        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={() => {
        if (!notification.read) onMarkRead(notification._id)
      }}
    >
      <div className={cn("mt-0.5 shrink-0", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-sm",
          notification.read
            ? "text-zinc-600 dark:text-zinc-400"
            : "text-zinc-900 dark:text-zinc-100 font-medium"
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
          {notification.message}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    )
  }

  return content
}
