import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken } from "@/lib/auth"
import { validateCsrfToken } from "@/lib/csrf"

const protectedRoutes = {
  trainer: ["/dashboard/trainer"],
  client: ["/dashboard/client"],
  any: ["/dashboard/profile"],
}

const publicOnlyRoutes = ["/login", "/register", "/reset-password"]

const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    stateChangingMethods.includes(request.method) &&
    pathname.startsWith("/api/")
  ) {
    const isAuthRoute = pathname.startsWith("/api/auth/")
    if (!isAuthRoute) {
      const valid = await validateCsrfToken(request)
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid CSRF token" },
          { status: 403 }
        )
      }
    }
  }

  const isProtectedRoute = Object.values(protectedRoutes)
    .flat()
    .some((route) => pathname.startsWith(route))

  const isPublicOnlyRoute = publicOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const accessToken = request.cookies.get("access_token")?.value

  let payload = null
  if (accessToken) {
    payload = await verifyAccessToken(accessToken)
  }

  if (isProtectedRoute && !payload) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  if (payload) {
    const isTrainerRoute = protectedRoutes.trainer.some((route) =>
      pathname.startsWith(route)
    )
    const isClientRoute = protectedRoutes.client.some((route) =>
      pathname.startsWith(route)
    )

    if (isTrainerRoute && payload.role !== "trainer") {
      const url = request.nextUrl.clone()
      url.pathname =
        payload.role === "client" ? "/dashboard/client" : "/login"
      return NextResponse.redirect(url)
    }

    if (isClientRoute && payload.role !== "client") {
      const url = request.nextUrl.clone()
      url.pathname =
        payload.role === "trainer" ? "/dashboard/trainer" : "/login"
      return NextResponse.redirect(url)
    }
  }

  if (isPublicOnlyRoute && payload) {
    const url = request.nextUrl.clone()
    url.pathname =
      payload.role === "trainer" ? "/dashboard/trainer" : "/dashboard/client"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
