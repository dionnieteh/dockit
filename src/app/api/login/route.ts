//docker-automation-website\src\app\api\login\route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Create/update session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.upsert({
      where: { userId: user.id },
      update: {
        sessionId: token,
        expiresAt: expiresAt,
      },
      create: {
        userId: user.id,
        expiresAt: expiresAt,
        sessionId: token,
      },
    })

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax'
    });

    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      }
    });
    response.headers.set('Set-Cookie', cookie)
    return response;

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Something went wrong' 
    }, { status: 500 })
  }
}