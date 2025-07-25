//docker-automation-website\src\app\api\logout\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Clear the cookie
    const cookie = serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire immediately
      path: '/',
      sameSite: 'lax'
    });

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', cookie)
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Something went wrong' 
    }, { status: 500 })
  }
}