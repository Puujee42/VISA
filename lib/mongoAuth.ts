import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { isAdminPhone, normalizePhone, phoneToEmail } from "@/lib/phone";

function hashPassword(password: string, salt?: string) {
  const s = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

function phoneVariants(phone: string) {
  const n = normalizePhone(phone);
  return [n, `+976${n}`, `976${n}`, `0${n}`];
}

export async function findUserByPhone(phone: string) {
  await connectToDB();
  const variants = phoneVariants(phone);
  return User.findOne({
    $or: [
      { phone: { $in: variants } },
      { "profile.phone": { $in: variants } },
      { "profile.mobile": { $in: variants } },
      { email: phoneToEmail(normalizePhone(phone)) },
    ],
  });
}

export async function mongoRegister(input: {
  phone: string;
  password: string;
  fullName: string;
}) {
  await connectToDB();
  const phone = normalizePhone(input.phone);
  const email = phoneToEmail(phone);
  const role = isAdminPhone(phone) ? "admin" : "guest";
  const fullName = input.fullName.trim() || `User ${phone}`;

  const existing = await findUserByPhone(phone);

  if (existing) {
    if (existing.passwordHash) {
      throw new Error("Энэ утасны дугаар бүртгэлтэй байна. Нэвтэрнэ үү.");
    }
    // Old Clerk/Mongo user without password — attach password now
    existing.passwordHash = hashPassword(input.password);
    existing.phone = phone;
    existing.email = existing.email || email;
    existing.fullName = existing.fullName || fullName;
    if (!existing.profile) existing.profile = {};
    existing.profile.phone = phone;
    if (isAdminPhone(phone)) existing.role = "admin";
    if (!existing.clerkId) {
      existing.clerkId = `mongo_${existing._id.toString()}`;
    }
    await existing.save();
    return existing;
  }

  const clerkId = `mongo_${createHash("sha256")
    .update(`${phone}:${Date.now()}`)
    .digest("hex")
    .slice(0, 24)}`;

  const user = await User.create({
    clerkId,
    email,
    phone,
    fullName,
    role,
    passwordHash: hashPassword(input.password),
    profile: { phone },
  });

  return user;
}

export async function mongoLogin(input: { phone: string; password: string }) {
  await connectToDB();
  const phone = normalizePhone(input.phone);
  const user = await findUserByPhone(phone);

  if (!user) {
    throw new Error("Утас эсвэл нууц үг буруу байна.");
  }

  if (!user.passwordHash) {
    throw new Error(
      "Энэ дугаар дээр нууц үг тохируулаагүй байна. Бүртгүүлэх хуудаснаас нууц үг үүсгэнэ үү.",
    );
  }

  if (!verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Утас эсвэл нууц үг буруу байна.");
  }

  if (isAdminPhone(phone) && user.role !== "admin") {
    user.role = "admin";
    user.phone = phone;
    await user.save();
  }

  return user;
}

export function mongoUserToSession(user: {
  _id?: { toString(): string };
  clerkId?: string;
  phone?: string;
  email?: string;
  fullName?: string;
  role?: string;
}) {
  const phone = normalizePhone(user.phone || "");
  return {
    id: String(user.clerkId || user._id?.toString()),
    phone,
    email: user.email || phoneToEmail(phone),
    fullName: user.fullName || `User ${phone}`,
    role: isAdminPhone(phone) ? "admin" : String(user.role || "guest"),
  };
}
