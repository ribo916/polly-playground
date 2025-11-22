import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";
import { getEnvValue } from "@/app/lib/getEnvValue";

export async function GET() {
  try {
    // 1️⃣ Read override-aware Polly config
    const BASE = await getEnvValue("POLLY_BASE_URL");
    const USER = await getEnvValue("POLLY_USERNAME");
    const PASS = await getEnvValue("POLLY_PASSWORD");
    const CID  = await getEnvValue("POLLY_CLIENT_ID");
    const SEC  = await getEnvValue("POLLY_CLIENT_SECRET");

    console.log("🔧 Effective ENV (users route):", { BASE });

    // 2️⃣ Direct token request to Polly (no internal /api/auth)
    const tokenResult = await logFetch(
      `${BASE}/api/v2/auth/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: USER ?? "",
          password: PASS ?? "",
          grant_type: "password",
          client_id: CID ?? "",
          client_secret: SEC ?? "",
        }),
      },
      "/api/v2/auth/token"
    );

    const access_token = tokenResult?.data?.access_token;
    if (!access_token) throw new Error("Missing access token");

    // 3️⃣ Direct call to Polly PE users endpoint
    const { data: usersData, status } = await logFetch(
      `${BASE}/api/v2/pe/users/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
      "/api/v2/pe/users/"
    );

    // 4️⃣ Return to UI
    return NextResponse.json(usersData, { status });

  } catch (err: any) {
    console.error("❌ Example route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
