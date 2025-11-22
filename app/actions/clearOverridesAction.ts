"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "polly-session-overrides";

export async function clearOverrides() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return { ok: true };
}
