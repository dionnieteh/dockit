//src/app/api/download/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop() || "";

    // 1. Get the download path from your Jobs table
    const job = await prisma.jobs.findUnique({
      where: { id: id },
      select: {
        userId: true,
        downloadPath: true
       },
    });

    if (!job || !job.downloadPath) {
      return new NextResponse("Job or download path not found", { status: 404 });
    }

    const pathInBucket = job.downloadPath;

    // 2. Download file from Supabase storage
    const { data, error } = await supabase.storage
      .from("docking-result")
      .download(pathInBucket);

    if (error || !data) {
      return new NextResponse("Failed to download file from Supabase", {
        status: 500,
      });
    }

    // 3. Stream file back as response
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=results_${id}.zip`,
      },
    });
  } catch (err) {
    console.error('Failed to fetch jobs from supabase for download:', err)
    return NextResponse.json({ error: 'Failed to fetch jobs from supabase for download' }, { status: 500 })
  }
}