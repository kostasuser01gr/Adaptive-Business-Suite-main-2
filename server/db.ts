import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * Creates a scoped transaction that sets the Postgres session variable 
 * for Row Level Security (RLS).
 */
export async function withTenant(userId: string, callback: (tx: any) => Promise<any>) {
  return pool.connect().then(async (client) => {
    try {
      await client.query(`SET app.current_user_id = '${userId}'`);
      const tx = drizzle(client, { schema });
      return await callback(tx);
    } finally {
      // Clear the session variable before releasing the client back to the pool
      await client.query(`RESET app.current_user_id`);
      client.release();
    }
  });
}
