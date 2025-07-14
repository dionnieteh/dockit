import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const receptor = await prisma.receptorFile.create({
      data: {
        name: body.name,
        description: body.description,
        filePath: body.filePath, // Assuming filePath is provided in the request
        fileSize: body.fileSize, // Assuming createdBy is provided in the request
        uploadedOn: new Date(),
      },
    });

    console.log('Receptor created:', receptor)

    return NextResponse.json(receptor)
  } catch (err) {
    console.error('Failed to create receptor:', err)
    return NextResponse.json({ 
      error: 'Failed to create receptor' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.receptorFile.findMany()
    return NextResponse.json(users)
  } catch (err) {
    console.error('Failed to fetch users:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}