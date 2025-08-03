import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.pathname.split("/").pop() || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await prisma.jobs.deleteMany({
      where: { userId: id },
    });

    return NextResponse.json({ message: "User's jobs deleted successfully" });
  } catch (err) {
    console.error("Failed to delete user's jobs:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}