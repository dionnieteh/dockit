// src/services/userService.ts
import { getUserById } from '@/lib/db/query'

// Contains functions that use db/query.ts and contain logic

// Example: checking if user exists, transforming data, combining queries

export async function getUserProfile(id: string) {
  const user = await getUserById(id)
  if (!user) throw new Error('User not found')
  // Add logic if needed
  return user
}
