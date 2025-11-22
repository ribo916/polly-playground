export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";
import { getEnvValue } from "@/app/lib/getEnvValue";

export async function POST() {
  try {
    // 🔍 Read override-aware Polly config
    const BASE = await getEnvValue("POLLY_BASE_URL");
    const USER = await getEnvValue("POLLY_USERNAME");
    const PASS = await getEnvValue("POLLY_PASSWORD");
    const CID  = await getEnvValue("POLLY_CLIENT_ID");
    const SEC  = await getEnvValue("POLLY_CLIENT_SECRET");
    const TIKR = await getEnvValue("ORG_TICKER");

    console.log("🔧 Effective ENV:", { BASE, TIKR });

    const body = new URLSearchParams({
      username: USER ?? "",
      password: PASS ?? "",
      grant_type: "password",
      client_id: CID ?? "",
      client_secret: SEC ?? "",
    });

    // 🔥 Direct call to Polly, not internal API → override cookies work
    const tokenResult = await logFetch(
      `${BASE}/api/v2/auth/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
      "/api/v2/auth/token"
    );

    return NextResponse.json(tokenResult.data, {
      status: tokenResult.status,
    });

  } catch (err) {
    console.error("❌ Auth route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
