import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { UserRole } from '@/lib/user-role'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const protectedRoutes = ['/docking', '/admin', '/history']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number
      userEmail: string
      userRole: string
    }

    // ✅ Only block access to /admin for non-admins
    if (pathname.startsWith('/admin') && decoded.userRole !== UserRole.ADMIN) {
      console.log("Redirecting non-admin from /admin")
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  } catch (_error) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/docking', '/docking/:path*', '/admin', '/admin/:path*', '/history', '/history/:path*']
}