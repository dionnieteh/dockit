import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const params = await prisma.defaultParameters.findUnique({
      where: { id: 1 },
    })

    if (!params) {
      return NextResponse.json({ error: 'Default parameters not found' }, { status: 404 })
    }

    return NextResponse.json(params)
  } catch (err) {
    console.error('Failed to fetch default parameters:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
