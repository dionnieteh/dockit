//docker-automation-website\src\utils\session.ts
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Helper function to create a session and store it
export async function createSession(userId: number) {
  const sessionId = uuidv4() // Generate a unique session ID
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7) // Set session expiration for 7 days

  // Store the session in your database or session store (e.g., Redis)
  await prisma.session.create({
    data: {
      sessionId,
      userId,
      expiresAt: expirationDate,
    }
  })

  return sessionId
}
