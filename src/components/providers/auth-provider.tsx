"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "trainer" | "client"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  accessToken: string | null
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setAccessToken(data.accessToken)
        setUser(data.user)
      } else {
        setAccessToken(null)
        setUser(null)
      }
    } catch {
      setAccessToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const router = useRouter()

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setAccessToken(null)
    setUser(null)
    router.push("/login")
  }, [router])

  useEffect(() => {
    async function init() {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
        })
        if (response.ok) {
          const data = await response.json()
          setAccessToken(data.accessToken)
          setUser(data.user)
        }
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!accessToken) return

    const refreshInterval = setInterval(
      () => {
        refreshSession()
      },
      14 * 60 * 1000
    )

    return () => clearInterval(refreshInterval)
  }, [accessToken, refreshSession])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, accessToken, refreshSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
