import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const receptorId = parseInt(params.id);
  if (isNaN(receptorId)) {
    return new Response(JSON.stringify({ message: "Invalid receptor ID" }), { status: 400 });
  }

  try {
    // Get receptor to delete file from storage
    const receptor = await prisma.receptorFile.findUnique({
      where: { id: receptorId },
    });

    if (!receptor) {
      return new Response(JSON.stringify({ message: "Receptor not found" }), { status: 404 });
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from("receptors")
      .remove([receptor.filePath]);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError.message);
      return new Response(JSON.stringify({ message: "Failed to delete file from storage" }), { status: 500 });
    }

    // Delete metadata from DB
    await prisma.receptorFile.delete({
      where: { id: receptorId },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error("Failed to delete receptor:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
  const { id: id2 } = await context.params;
    
    const id = parseInt(id2);  // ✅ convert to number
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid receptor file ID" }, { status: 400 });
    }

    const body = await req.json()
    console.log('Updating receptor file with body:', id, body)

    const updatedReceptor = await prisma.receptorFile.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        filePath: body.filePath,
        fileSize: body.fileSize,
        uploadedOn: new Date(), // Update the uploaded date to now
      },
    })

    return NextResponse.json(updatedReceptor)
  } catch (err) {
    console.error('Failed to update receptor file:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

