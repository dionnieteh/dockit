import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const receptor = await prisma.receptorFile.create({
      data: {
        name: body.name,
        description: body.description,
        filePath: body.filePath,
        fileSize: body.fileSize,
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
    const files = await prisma.receptorFile.findMany()
    return NextResponse.json(files)
  } catch (err) {
    console.error('Failed to fetch files:', err)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}