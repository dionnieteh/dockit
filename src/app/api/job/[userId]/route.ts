import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.pathname.split("/").pop() || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const jobs = await prisma.jobs.findMany({
      where: { userId: id },
      include: {
        user: true,
      },
    }); return NextResponse.json(jobs)
  } catch (err) {
    console.error('Failed to fetch jobs by user:', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}