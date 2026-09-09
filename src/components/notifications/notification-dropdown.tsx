"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/notifications?limit=15")
        if (res.ok && !cancelled) {
          const data = await res.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } catch {
        // ignore
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

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
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      console.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notifications/read-all", { method: "PUT" })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch {
      console.error("Failed to mark all as read")
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
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No notifications yet.
              </div>
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
