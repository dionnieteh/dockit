// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)  // ✅ convert to number
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        institution: body.institution ? body.institution : "", // ✅ handle optional field
        purpose: body.purpose ? body.purpose : "", // ✅ handle optional field
      },
    })

    return NextResponse.json(updatedUser)
  } catch (err) {
    console.error('Failed to update user:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

//create function to delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string
} }) {
  try {
    const id = parseInt(params.id)  // ✅ convert to number
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (err) {
    console.error('Failed to delete user:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
