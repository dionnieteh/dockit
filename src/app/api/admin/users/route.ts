
// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)
  } catch (err) {
    console.error('Failed to fetch users:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    // Check if the user already exists
    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists with this email'
      }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user using Prisma
    const admin = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        role: role,
        institution: "",
        purpose: "",
      },
    });

    // Return the admin without the password
    const { password: _, ...adminWithoutPassword } = admin;
    return NextResponse.json(adminWithoutPassword)
  } catch (err) {
    console.error('Failed to create admin:', err)
    return NextResponse.json({ 
      error: 'Failed to create admin' 
    }, { status: 500 })
  }
}