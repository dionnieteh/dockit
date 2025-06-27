import { db } from './index';

// Wrap raw SQL queries to avoid duplication

// Add convenience and security (like prepared statements)

export async function getUserById(id: string) {
  const res = await db.query('SELECT * FROM users WHERE id = $1', [id])
  return res.rows[0]
}