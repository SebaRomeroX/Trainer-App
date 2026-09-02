import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken } from "@/lib/auth"

const protectedRoutes = {
  trainer: ["/trainer"],
  client: ["/client"],
  any: ["/profile"],
}

const publicOnlyRoutes = ["/login", "/register", "/reset-password"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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
      url.pathname = payload.role === "client" ? "/client" : "/login"
      return NextResponse.redirect(url)
    }

    if (isClientRoute && payload.role !== "client") {
      const url = request.nextUrl.clone()
      url.pathname = payload.role === "trainer" ? "/trainer" : "/login"
      return NextResponse.redirect(url)
    }
  }

  if (isPublicOnlyRoute && payload) {
    const url = request.nextUrl.clone()
    url.pathname = payload.role === "trainer" ? "/trainer" : "/client"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
