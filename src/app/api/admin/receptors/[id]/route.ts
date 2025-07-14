import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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
