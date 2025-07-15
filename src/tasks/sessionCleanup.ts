// src/tasks/sessionCleanup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanupExpiredSessions() {
  try {
    await prisma.session.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
    console.log('Expired sessions cleaned up successfully.');
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}