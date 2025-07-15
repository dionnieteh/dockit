import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const receptorId = parseInt(url.pathname.split("/").pop() || "");

  if (isNaN(receptorId)) {
    return new Response(JSON.stringify({ message: "Invalid receptor ID" }), { status: 400 });
  }

  try {
    const receptor = await prisma.receptorFile.findUnique({
      where: { id: receptorId },
    });

    if (!receptor) {
      return new Response(JSON.stringify({ message: "Receptor not found" }), { status: 404 });
    }

    const { error: deleteError } = await supabase.storage
      .from("receptors")
      .remove([receptor.filePath]);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError.message);
      return new Response(JSON.stringify({ message: "Failed to delete file from storage" }), { status: 500 });
    }

    await prisma.receptorFile.delete({
      where: { id: receptorId },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error("Failed to delete receptor:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const receptorId = parseInt(url.pathname.split("/").pop() || "");

  if (isNaN(receptorId)) {
    return new Response(JSON.stringify({ message: "Invalid receptor ID" }), { status: 400 });
  }

  try {
    const body = await req.json();
    const updatedReceptor = await prisma.receptorFile.update({
      where: { id: receptorId },
      data: {
        name: body.name,
        description: body.description,
        filePath: body.filePath,
        fileSize: body.fileSize,
        uploadedOn: new Date(), // Update the uploaded date to now
      },
    });
    return NextResponse.json(updatedReceptor);
  } catch (err) {
    console.error("Failed to update receptor file:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}