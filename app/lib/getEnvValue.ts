"use server";

import { cookies } from "next/headers";
import { decryptCookieValue } from "@/app/lib/cookieEncryption";

const COOKIE_NAME = "polly-session-overrides";

/**
 * Gets an environment variable value, checking session overrides first,
 * then falling back to process.env. Works across all API routes and workers.
 */
export async function getEnvValue(
  key: string
): Promise<string | undefined> {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(COOKIE_NAME)?.value;

  if (encrypted) {
    const overrides = decryptCookieValue(encrypted);
    if (overrides && overrides[key] !== undefined) {
      return overrides[key];
    }
  }

  return process.env[key];
}
