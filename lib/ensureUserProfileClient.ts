"use client";

export async function ensureUserProfileClient(input: {
  id: string;
  email: string;
  fullName?: string;
}) {
  try {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authId: input.id,
        email: input.email,
        fullName: input.fullName,
      }),
    });
  } catch (error) {
    console.warn("Profile sync failed (non-fatal):", error);
  }
}
