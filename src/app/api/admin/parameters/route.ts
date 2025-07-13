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

// PUT /api/admin/parameters
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const updated = await prisma.defaultParameters.update({
      where: { id: 1 },
      data: {
        ...body, // this assumes body contains fields like gridSizeX, centerX, etc.
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Failed to update default parameters:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}