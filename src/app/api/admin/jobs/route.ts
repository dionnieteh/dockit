import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const jobs = await prisma.job.findMany()
    return NextResponse.json(jobs)
  } catch (err) {
    console.error('Failed to fetch jobs:', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}