"use server";

import { cookies } from "next/headers";
import { encryptCookieValue } from "@/app/lib/cookieEncryption";

const COOKIE_NAME = "polly-session-overrides";

export async function applyOverrides(values: Record<string, string>) {
  // Filter out empty values
  const clean = Object.fromEntries(
    Object.entries(values).filter(([_, v]) => v && v.trim() !== "")
  );

  // Encrypt and store in cookie
  const encrypted = encryptCookieValue(clean);

  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: encrypted,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Cookie expires in 24 hours (session-based)
    maxAge: 60 * 60 * 24,
  });

  return { ok: true };
}
