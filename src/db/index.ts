import fs from "fs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { URL } from "url";

const databaseUrl = process.env.DATABASE_URL;
const sslCaPath = process.env.DATABASE_SSL_CA;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const getPoolConfig = () => {
  if (!sslCaPath) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  const ca = fs.readFileSync(sslCaPath, "utf8");
  const poolConfig: mysql.PoolOptions = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname?.slice(1) ?? undefined,
    ssl: { ca },
  };

  // preserve additional query params if present
  for (const [key, value] of url.searchParams.entries()) {
    if (key === "ssl") continue;
    (poolConfig as any)[key] = value;
  }

  return poolConfig;
};

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsMysqlPool?: mysql.Pool;
};

export const pool =
  globalForDb.__arenaNextJsMysqlPool ??
  mysql.createPool(getPoolConfig());

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsMysqlPool = pool;
}

export const db = drizzle(pool);
