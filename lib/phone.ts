/** Mongolian mobile: keep last 8 digits when possible. */
export function normalizePhone(input: string): string {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.length >= 8) {
    // +976XXXXXXXX or 976XXXXXXXX → last 8
    if (digits.startsWith("976") && digits.length >= 11) {
      return digits.slice(-8);
    }
    return digits.slice(-8);
  }
  return digits;
}

export function phoneToEmail(phone: string): string {
  return `${normalizePhone(phone)}@phone.aupair.mn`;
}

export function phoneE164(phone: string): string {
  return `+976${normalizePhone(phone)}`;
}

/** Always-admin phones (plus ADMIN_PHONES from env). */
const HARDCODED_ADMIN_PHONES = ["99918122"];

export function getAdminPhones(): string[] {
  const raw =
    process.env.ADMIN_PHONES ||
    process.env.NEXT_PUBLIC_ADMIN_PHONES ||
    "";
  const fromEnv = raw
    .split(/[,;\s]+/)
    .map(normalizePhone)
    .filter((p) => p.length >= 8);

  return Array.from(new Set([...HARDCODED_ADMIN_PHONES, ...fromEnv]));
}

export function isAdminPhone(phone: string): boolean {
  const n = normalizePhone(phone);
  return n.length >= 8 && getAdminPhones().includes(n);
}
