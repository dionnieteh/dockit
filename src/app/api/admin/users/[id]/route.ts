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
        institution: body.institution,
        purpose: body.purpose,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (err) {
    console.error('Failed to update user:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
