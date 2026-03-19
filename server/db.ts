import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { env, isProduction } from "./config";

function resolveSsl(): false | { rejectUnauthorized: false } {
  if (env.DATABASE_SSL_MODE === "disable") {
    return false;
  }

  if (env.DATABASE_SSL_MODE === "require") {
    return { rejectUnauthorized: false };
  }

  return isProduction ? { rejectUnauthorized: false } : false;
}

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: env.NODE_ENV === "test",
  ssl: resolveSsl(),
});

export const db = drizzle(pool, { schema });

export async function checkDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query("select 1");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error };
  } finally {
    client.release();
  }
}

export async function closeDatabasePool() {
  await pool.end();
}

export async function withTenant(
  userId: string,
  callback: (tx: any) => Promise<any>,
) {
  const client = await pool.connect();

  try {
    await client.query(
      "select set_config('app.current_user_id', $1, false)",
      [userId],
    );

    const tx = drizzle(client, { schema });
    return await callback(tx);
  } finally {
    await client.query("RESET app.current_user_id");
    client.release();
  }
}
