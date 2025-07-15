import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const zipPath = path.join("/tmp", id, "results.zip");

  try {
    await fs.access(zipPath);
    const buffer = await fs.readFile(zipPath);

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