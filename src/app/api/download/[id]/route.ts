import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const zipPath = path.join("/tmp", id, "results.zip");

  try {
    await fs.access(zipPath); // Check if file exists
    const buffer = await fs.readFile(zipPath); // Read file into memory

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=results_${id}.zip`,
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
