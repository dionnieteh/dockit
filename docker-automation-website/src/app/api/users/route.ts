//This is the file exposed as /api/users

// It imports the service, handles request and response
import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/services/userService'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('id')

  try {
    const user = await getUserProfile(userId!)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
}
