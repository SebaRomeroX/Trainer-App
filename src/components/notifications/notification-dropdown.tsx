"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import { Bell, CheckCheck, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { useErrorToast } from "@/hooks/use-error-toast"
import { NotificationItem } from "./notification-item"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

interface NotificationsData {
  notifications: Notification[]
  unreadCount: number
}

const NOTIFICATIONS_KEY = "/api/notifications?limit=15"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json() as Promise<NotificationsData>
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data, error, mutate } = useSWR<NotificationsData>(
    NOTIFICATIONS_KEY,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  )

  useErrorToast(error, "Failed to load notifications")

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleMarkRead = async (id: string) => {
    // Optimistic: flip the item and decrement the badge immediately.
    await mutate(
      (current) => {
        if (!current) return current
        const target = current.notifications.find((n) => n._id === id)
        if (!target || target.read) return current
        return {
          notifications: current.notifications.map((n) =>
            n._id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, current.unreadCount - 1),
        }
      },
      { revalidate: false }
    )

    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      mutate()
    } catch {
      toast.error("Failed to mark notification as read")
      mutate()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notifications/read-all", { method: "PUT" })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      await mutate(
        (current) =>
          current
            ? {
                notifications: current.notifications.map((n) => ({ ...n, read: true })),
                unreadCount: 0,
              }
            : current,
        { revalidate: true }
      )
    } catch {
      toast.error("Failed to mark all as read")
      mutate()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="h-7 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No notifications yet"
                className="py-8"
              />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
