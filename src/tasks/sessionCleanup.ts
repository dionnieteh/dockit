// src/tasks/sessionCleanup.ts
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Instantiate the Prisma client

// Define the session cleanup function
export async function cleanupExpiredSessions() {
  try {
    // Example: Cleanup sessions older than 1 day
    await prisma.session.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Delete sessions older than 1 day
        },
      },
    });
    console.log('Expired sessions cleaned up successfully.');
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}
