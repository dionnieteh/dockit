import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany()

    return NextResponse.json(users)
  } catch (err) {
    console.error('Failed to fetch users:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}