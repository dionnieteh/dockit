// src/utils/session.ts
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function createSession(userId: number) {
  const sessionId = uuidv4()
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7)

  await prisma.session.create({
    data: {
      sessionId,
      userId,
      expiresAt: expirationDate,
    }
  })

  return sessionId
}