import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: number; 
      userEmail: string 
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        institution: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user data with combined name
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      institution: user.institution
    })

  } catch (error) {
    console.error('Error in /api/me:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}