import fs from "fs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { URL } from "url";

const databaseUrl = process.env.DATABASE_URL;
const sslCaEnv = process.env.DATABASE_SSL_CA;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const loadSslCa = (): string | undefined => {
  if (!sslCaEnv) return undefined;

  const looksLikePath = sslCaEnv.startsWith(".") || sslCaEnv.includes("/") || sslCaEnv.endsWith(".pem");
  if (looksLikePath) {
    if (fs.existsSync(sslCaEnv)) {
      return fs.readFileSync(sslCaEnv, "utf8");
    }
    throw new Error(
      "DATABASE_SSL_CA appears to be a file path but the file was not found. " +
      "On Vercel, set DATABASE_SSL_CA to the full PEM certificate text, not a local file path."
    );
  }

  return sslCaEnv;
};

const getPoolConfig = () => {
  const sslCa = loadSslCa();
  if (!sslCa) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  const poolConfig: mysql.PoolOptions = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname?.slice(1) ?? undefined,
    ssl: { ca: sslCa },
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

const poolConfig = getPoolConfig();
export const pool =
  globalForDb.__arenaNextJsMysqlPool ??
  (typeof poolConfig === "string"
    ? mysql.createPool(poolConfig)
    : mysql.createPool(poolConfig));

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsMysqlPool = pool;
}

export const db = drizzle(pool);
