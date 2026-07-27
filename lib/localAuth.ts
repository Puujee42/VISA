import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { isAdminPhone, normalizePhone, phoneToEmail } from "@/lib/phone";

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "local-users.json");
export const LOCAL_SESSION_COOKIE = "aupair_local_session";

type LocalUser = {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: string;
  passwordHash: string;
  createdAt: string;
};

type SessionPayload = {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: string;
  exp: number;
};

function authSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.ADMIN_SECRET ||
    "aupair-dev-secret-change-me"
  );
}

function hashPassword(password: string, salt?: string) {
  const s = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

async function readUsers(): Promise<LocalUser[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: LocalUser[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function signLocalSession(user: {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: string;
}) {
  const payload: SessionPayload = {
    id: user.id,
    phone: user.phone,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", authSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyLocalSession(token: string | undefined | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", authSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload?.id || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (isAdminPhone(payload.phone)) payload.role = "admin";
    return payload;
  } catch {
    return null;
  }
}

export async function localRegister(input: {
  phone: string;
  password: string;
  fullName: string;
}) {
  const phone = normalizePhone(input.phone);
  const email = phoneToEmail(phone);
  const users = await readUsers();
  if (users.some((u) => u.phone === phone || u.email === email)) {
    throw new Error("Энэ утасны дугаар бүртгэлтэй байна. Нэвтэрнэ үү.");
  }

  const user: LocalUser = {
    id: createHash("sha256").update(`${phone}:${Date.now()}`).digest("hex").slice(0, 24),
    phone,
    email,
    fullName: input.fullName.trim() || `User ${phone}`,
    role: isAdminPhone(phone) ? "admin" : "guest",
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function localLogin(input: { phone: string; password: string }) {
  const phone = normalizePhone(input.phone);
  const users = await readUsers();
  const user = users.find((u) => u.phone === phone || u.email === phoneToEmail(phone));
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Утас эсвэл нууц үг буруу байна.");
  }
  if (isAdminPhone(phone) && user.role !== "admin") {
    user.role = "admin";
    await writeUsers(users);
  }
  return user;
}

export function localSessionCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
