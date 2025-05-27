import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role, institution, purpose } = body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user using Prisma
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        institution,
        purpose,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
