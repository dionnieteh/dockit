//docker-automation-website\src\app\api\register\route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { capitalize } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role, institution, purpose } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User already exists with this email'
      }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: capitalize(firstName),
        lastName: capitalize(lastName),
        email,
        password: hashedPassword,
        role,
        institution: capitalize(institution),
        purpose,
      },
    });

    const token = jwt.sign({
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`
    }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    })

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: expiresAt,
        sessionId: token,
      },
    });

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax'
    });

    const response = NextResponse.json({
      success: true,
      userId: user.id,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    })
    response.headers.set('Set-Cookie', cookie)
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    }, { status: 500 })
  }
}