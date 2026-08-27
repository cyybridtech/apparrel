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
    return { host: "127.0.0.1", user: "root", database: "footwear" };
  }

  try {
    // Strip ?ssl=true or &ssl=true boolean params that cause mysql2 to throw "SSL profile must be an object"
    const sanitizedUrlStr = databaseUrl.replace(/([?&])ssl=(true|false|1|0)/gi, "$1_ssl_flag=$2");
    const url = new URL(sanitizedUrlStr);
    const sslCa = loadSslCa();

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

    // Ensure ssl is ALWAYS an object, never a boolean
    if (sslCa) {
      poolConfig.ssl = { ca: sslCa, rejectUnauthorized: true };
    } else {
      // TiDB Cloud / AWS / PlanetScale require SSL object
      poolConfig.ssl = { minVersion: "TLSv1.2", rejectUnauthorized: false };
    }

    return poolConfig;
  } catch (err) {
    console.error("Failed to parse DATABASE_URL:", err);
    return {
      host: "127.0.0.1",
      user: "root",
      database: "footwear",
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
    };
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
