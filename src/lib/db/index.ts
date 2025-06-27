import { Pool } from "pg";
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default pool;

// export async function query<T = any>(text: string, params?: any[]) {
//   const res = await pool.query<T>(text, params);
//   return res.rows;
// }
