import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}

export async function getUserFromRequest(): Promise<User | null> {
  try {
    // Get token from cookie
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || "fallback_secret") as User

    return decoded
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
