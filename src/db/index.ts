import fs from "fs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { URL } from "url";

const databaseUrl = process.env.DATABASE_URL;
const sslCaEnv = process.env.DATABASE_SSL_CA;

export const isDbConfigured = Boolean(databaseUrl);

const loadSslCa = (): string | undefined => {
  if (!sslCaEnv) return undefined;

  const looksLikePath = sslCaEnv.startsWith(".") || sslCaEnv.includes("/") || sslCaEnv.endsWith(".pem");
  if (looksLikePath && fs.existsSync(sslCaEnv)) {
    return fs.readFileSync(sslCaEnv, "utf8");
  }

  return sslCaEnv;
};

const getPoolConfig = (): mysql.PoolOptions => {
  if (!databaseUrl) {
    // Return placeholder config so module loading does not crash top-level evaluation
    return { host: "127.0.0.1", user: "root", database: "footwear" };
  }

  try {
    const url = new URL(databaseUrl);
    const sslCa = loadSslCa();

    const isCloud =
      url.hostname.includes("tidbcloud.com") ||
      url.hostname.includes("amazonaws.com") ||
      url.hostname.includes("planetscale") ||
      url.hostname.includes("aivencloud") ||
      url.searchParams.has("ssl") ||
      process.env.NODE_ENV === "production";

    const poolConfig: mysql.PoolOptions = {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname?.slice(1) ?? undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 20000,
    };

    if (sslCa) {
      poolConfig.ssl = { ca: sslCa, rejectUnauthorized: true };
    } else if (isCloud) {
      poolConfig.ssl = { minVersion: "TLSv1.2", rejectUnauthorized: false };
    }

    return poolConfig;
  } catch (err) {
    console.error("Failed to parse DATABASE_URL, using URI configuration:", err);
    return { uri: databaseUrl } as any;
  }
};

const globalForDb = globalThis as typeof globalThis & {
  __kicksGhanaMysqlPool?: mysql.Pool;
};

const poolConfig = getPoolConfig();

export const pool =
  globalForDb.__kicksGhanaMysqlPool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__kicksGhanaMysqlPool = pool;
}

export const db = drizzle(pool);
