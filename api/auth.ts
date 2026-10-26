import crypto from "node:crypto";
import { pool } from "../src/db/index.js";

type QueryResult = { insertId?: number; affectedRows?: number };
type DatabaseClient = {
  execute: (sql: string, values?: unknown[]) => Promise<[unknown, unknown]>;
};
type UserRow = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
  sellerId: number | string | null;
  address: string | null;
  city: string | null;
  region: string | null;
};
type SessionPayload = {
  userId: number;
  role: "admin" | "seller" | "customer";
  sellerId?: number;
  name: string;
  email: string;
  exp: number;
};
type Env = Record<string, string | undefined>;
type RequestLike = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
  url?: string;
};
type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => unknown;
  end?: () => unknown;
  setHeader?: (name: string, value: string) => void;
};

class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedRoles = new Set(["admin", "seller", "customer"]);
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizedText(value: unknown, maximum: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function passwordHash(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, salt, digestHex] = String(encoded || "").split("$");
  if (algorithm !== "scrypt" || !salt || !digestHex || !/^[a-f0-9]{128}$/i.test(digestHex)) return false;
  const expected = Buffer.from(digestHex, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function createSessionToken(payload: Omit<SessionPayload, "exp">, secret: string): string {
  const fullPayload: SessionPayload = { ...payload, exp: Date.now() + sessionLifetimeMs };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `cyybrid.${encoded}.${signature}`;
}

function verifySessionToken(token: string, secret: string): SessionPayload | null {
  if (!token || token.length > 4096) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "cyybrid") return null;
    const [, encoded, signature] = parts;
    const expected = crypto.createHmac("sha256", secret).update(encoded).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (
      !Number.isSafeInteger(payload.userId) || payload.userId <= 0 ||
      !allowedRoles.has(payload.role) || !Number.isFinite(payload.exp) || Date.now() >= payload.exp ||
      typeof payload.name !== "string" || typeof payload.email !== "string"
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionSecret(env: Env): string {
  const secret = env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new AuthError(503, "Authentication is not configured yet. Please try again later.");
  }
  return secret;
}

async function queryRows<T>(db: DatabaseClient, sql: string, values: unknown[] = []): Promise<T[]> {
  const [rows] = await db.execute(sql, values);
  return rows as T[];
}

async function findUserByEmail(db: DatabaseClient, email: string): Promise<UserRow | null> {
  const rows = await queryRows<UserRow>(db, `
    SELECT id, name, email, phone, password_hash AS passwordHash,
           role, seller_id AS sellerId, address, city, region
    FROM users
    WHERE LOWER(email) = ?
    LIMIT 1
  `, [email]);
  return rows[0] || null;
}

async function findUserById(db: DatabaseClient, userId: number): Promise<UserRow | null> {
  const rows = await queryRows<UserRow>(db, `
    SELECT id, name, email, phone, password_hash AS passwordHash,
           role, seller_id AS sellerId, address, city, region
    FROM users
    WHERE id = ?
    LIMIT 1
  `, [userId]);
  return rows[0] || null;
}

async function sellerProfile(db: DatabaseClient, user: UserRow): Promise<{ storeName: string; status: string } | undefined> {
  if (user.role !== "seller" || user.sellerId == null) return undefined;
  const rows = await queryRows<{ storeName: string; status: string }>(db, `
    SELECT store_name AS storeName, status
    FROM sellers
    WHERE id = ?
    LIMIT 1
  `, [Number(user.sellerId)]);
  return rows[0];
}

function publicUser(user: UserRow, seller?: { storeName: string; status: string }) {
  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as SessionPayload["role"],
    sellerId: user.sellerId == null ? undefined : Number(user.sellerId),
    sellerStore: seller?.storeName,
    mustSetPassword: false,
    address: user.address || undefined,
    city: user.city || undefined,
    region: user.region || undefined,
  };
}

async function ensureBootstrapAdmin(db: DatabaseClient, env: Env): Promise<void> {
  const configuredEmail = normalizedText(env.ADMIN_BOOTSTRAP_EMAIL, 255).toLowerCase();
  const configuredPassword = env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!configuredEmail && !configuredPassword) return;
  if (!configuredEmail || !emailPattern.test(configuredEmail) || !configuredPassword || configuredPassword.length < 14) {
    throw new AuthError(503, "Administrator bootstrap settings are incomplete or invalid.");
  }

  const existing = await findUserByEmail(db, configuredEmail);
  if (existing) return;

  try {
    await db.execute(`
      INSERT INTO users (name, email, phone, password_hash, role, address, city, region)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, ?)
    `, [
      "Platform Administrator",
      configuredEmail,
      "",
      passwordHash(configuredPassword),
      "",
      "",
      "Greater Accra",
    ]);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "ER_DUP_ENTRY" && code !== "SQLITE_CONSTRAINT_UNIQUE") throw error;
    const raced = await findUserByEmail(db, configuredEmail);
    if (!raced) throw error;
  }
}

function getRoute(req: RequestLike): string {
  const queryRoute = req.query?.route;
  if (typeof queryRoute === "string") return queryRoute.replace(/^\/+|\/+$/g, "");
  const url = new URL(req.url || "/", `https://${req.headers?.host || "localhost"}`);
  const route = url.searchParams.get("route");
  if (route) return route.replace(/^\/+|\/+$/g, "");
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

function requestHeader(req: RequestLike, name: string): string {
  const value = req.headers?.[name.toLowerCase()] ?? req.headers?.[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function bearerToken(req: RequestLike): string {
  const header = requestHeader(req, "authorization");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

async function authenticate(req: RequestLike, db: DatabaseClient, secret: string): Promise<{ token: SessionPayload; user: UserRow }> {
  const token = verifySessionToken(bearerToken(req), secret);
  if (!token) throw new AuthError(401, "Your session is invalid or expired. Please sign in again.");
  const user = await findUserById(db, token.userId);
  if (!user || !allowedRoles.has(user.role)) {
    throw new AuthError(401, "Your account is no longer available. Please sign in again.");
  }
  return { token, user };
}

function safeResponseHeaders(res: ResponseLike): void {
  res.setHeader?.("Cache-Control", "no-store, max-age=0");
  res.setHeader?.("X-Content-Type-Options", "nosniff");
}

export function createAuthHandler(db: DatabaseClient | null, env: Env = process.env) {
  return async function authHandler(req: RequestLike, res: ResponseLike): Promise<unknown> {
    safeResponseHeaders(res);
    if (req.method === "OPTIONS") {
      res.setHeader?.("Allow", "GET, POST, OPTIONS");
      return res.status(204).end?.();
    }

    const route = getRoute(req);
    const method = (req.method || "GET").toUpperCase();
    const methodAllowed =
      (route === "login" && method === "POST") ||
      (route === "register" && method === "POST") ||
      (route === "me" && method === "GET") ||
      (route === "complete-security-setup" && method === "POST");
    if (!methodAllowed) {
      return res.status(route ? 405 : 404).json({ error: route ? "Method not allowed." : "Authentication route not found." });
    }
    if (!db) {
      return res.status(503).json({ error: "Authentication storage is unavailable. Please try again later." });
    }

    try {
      const secret = getSessionSecret(env);
      await ensureBootstrapAdmin(db, env);
      const body = record(req.body);

      if (route === "login") {
        const rawIdentifier = normalizedText(body.email || body.username || body.identifier, 255).toLowerCase();
        const bootstrapEmail = normalizedText(env.ADMIN_BOOTSTRAP_EMAIL, 255).toLowerCase();
        if (rawIdentifier === "admin" && bootstrapEmail) {
          const bootstrapUser = await findUserByEmail(db, bootstrapEmail);
          if (bootstrapUser && bootstrapUser.role !== "admin") {
            throw new AuthError(409, "The configured administrator email is already registered to a non-administrator account.");
          }
        }
        const email = rawIdentifier === "admin" && bootstrapEmail ? bootstrapEmail : rawIdentifier;
        const password = typeof body.password === "string" ? body.password : "";
        if (!emailPattern.test(email) || password.length < 1 || password.length > 1024) {
          throw new AuthError(400, "Enter a valid email address and password.");
        }

        const user = await findUserByEmail(db, email);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          throw new AuthError(401, "Invalid email or password. Please check your credentials.");
        }
        if (!allowedRoles.has(user.role)) {
          throw new AuthError(403, "This account does not have a supported access role.");
        }

        const seller = await sellerProfile(db, user);
        if (user.role === "seller" && seller?.status !== "active") {
          throw new AuthError(403, "This seller account is not active. Contact your platform administrator.");
        }
        const safeUser = publicUser(user, seller);
        const token = createSessionToken({
          userId: safeUser.id,
          role: safeUser.role,
          sellerId: safeUser.sellerId,
          name: safeUser.name,
          email: safeUser.email,
        }, secret);
        return res.status(200).json({ success: true, token, user: safeUser, seller });
      }

      if (route === "register") {
        const name = normalizedText(body.name, 255);
        const email = normalizedText(body.email, 255).toLowerCase();
        const phone = normalizedText(body.phone, 50);
        const password = typeof body.password === "string" ? body.password : "";
        const address = normalizedText(body.address, 255);
        const city = normalizedText(body.city, 100) || "Accra";
        const region = normalizedText(body.region, 100) || "Greater Accra";

        if (name.length < 2) throw new AuthError(400, "Please enter your full name.");
        if (!emailPattern.test(email)) throw new AuthError(400, "Please enter a valid email address.");
        if (phone.length < 7) throw new AuthError(400, "Please enter a valid phone number.");
        if (password.length < 12 || password.length > 1024) throw new AuthError(400, "Password must be at least 12 characters long.");

        const existing = await findUserByEmail(db, email);
        if (existing) throw new AuthError(409, "An account with this email already exists. Please sign in.");

        let insertResult: QueryResult;
        try {
          const [result] = await db.execute(`
            INSERT INTO users (name, email, phone, password_hash, role, address, city, region)
            VALUES (?, ?, ?, ?, 'customer', ?, ?, ?)
          `, [name, email, phone, passwordHash(password), address, city, region]);
          insertResult = result as QueryResult;
        } catch (error) {
          if ((error as { code?: string })?.code === "ER_DUP_ENTRY") {
            throw new AuthError(409, "An account with this email already exists. Please sign in.");
          }
          throw error;
        }

        const userId = Number(insertResult.insertId);
        const user = await findUserById(db, userId);
        if (!user) throw new AuthError(503, "Your account was created, but the session could not be started. Please sign in.");
        const safeUser = publicUser(user);
        const token = createSessionToken({ userId: safeUser.id, role: safeUser.role, name: safeUser.name, email: safeUser.email }, secret);
        return res.status(201).json({ success: true, token, user: safeUser });
      }

      if (route === "me") {
        const { user } = await authenticate(req, db, secret);
        const seller = await sellerProfile(db, user);
        return res.status(200).json({ success: true, user: publicUser(user, seller), seller });
      }

      const { user } = await authenticate(req, db, secret);
      const newEmail = normalizedText(body.email, 255).toLowerCase();
      const newPassword = typeof body.password === "string" ? body.password : "";
      const newPhone = normalizedText(body.phone, 50) || user.phone;
      if (!emailPattern.test(newEmail)) throw new AuthError(400, "Please provide a valid permanent email address.");
      if (newPassword.length < 12 || newPassword.length > 1024) throw new AuthError(400, "New password must be at least 12 characters long.");

      const duplicate = await findUserByEmail(db, newEmail);
      if (duplicate && Number(duplicate.id) !== Number(user.id)) {
        throw new AuthError(409, "This email address is already in use by another account.");
      }
      await db.execute(`
        UPDATE users
        SET email = ?, phone = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newEmail, newPhone, passwordHash(newPassword), Number(user.id)]);
      if (user.role === "seller" && user.sellerId != null) {
        await db.execute(`UPDATE sellers SET email = ?, phone = ? WHERE id = ?`, [newEmail, newPhone, Number(user.sellerId)]);
      }

      const updated = await findUserById(db, Number(user.id));
      if (!updated) throw new AuthError(404, "User account not found.");
      const seller = await sellerProfile(db, updated);
      const safeUser = publicUser(updated, seller);
      const token = createSessionToken({
        userId: safeUser.id,
        role: safeUser.role,
        sellerId: safeUser.sellerId,
        name: safeUser.name,
        email: safeUser.email,
      }, secret);
      return res.status(200).json({ success: true, message: "Security credentials updated.", token, user: safeUser, seller });
    } catch (error) {
      const status = error instanceof AuthError ? error.status : 500;
      const message = error instanceof AuthError ? error.message : "Authentication service is temporarily unavailable.";
      const code = (error as { code?: string })?.code;
      console.error("Persistent authentication request failed", { route, status, code });
      return res.status(status).json({ error: message });
    }
  };
}

const defaultHandler = createAuthHandler(pool as unknown as DatabaseClient | null);

export default async function handler(req: RequestLike, res: ResponseLike): Promise<unknown> {
  return defaultHandler(req, res);
}
