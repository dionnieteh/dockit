import { Pool, PoolClient, QueryResult } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function query(text: string, params: (string | number | boolean | null)[] = []): Promise<QueryResult> {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  const originalQuery = client.query.bind(client)
  const release = client.release.bind(client)

  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!")
    console.error(`The last executed query on this client was: ${JSON.stringify((client).lastQuery)}`)
  }, 5000)

  client.query = (...args: [string, (string | number | boolean | null)[]?]) => {
    (client).lastQuery = args
    return originalQuery(...args)
  }

  client.release = () => {
    clearTimeout(timeout)
    client.query = originalQuery
    client.release = release
    return release()
  }

  return client
}
