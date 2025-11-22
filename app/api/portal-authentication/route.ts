import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";
import { getEnvValue } from "@/app/lib/getEnvValue";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    // 1️⃣ Read override-aware Polly env
    const BASE = await getEnvValue("POLLY_BASE_URL");
    const USER = await getEnvValue("POLLY_USERNAME");
    const PASS = await getEnvValue("POLLY_PASSWORD");
    const CID  = await getEnvValue("POLLY_CLIENT_ID");
    const SEC  = await getEnvValue("POLLY_CLIENT_SECRET");

    // 2️⃣ Direct token request to Polly (no /api/auth recursion)
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

    if (!tokenResult?.data?.access_token) {
      return NextResponse.json(
        { error: "Auth failed" },
        { status: tokenResult.status || 500 }
      );
    }

    const access_token = tokenResult.data.access_token;

    // 3️⃣ Direct call to Polly's portal login service
    const body = JSON.stringify({ username });
    const portalResult = await logFetch(
      `${BASE}/api/v2/pe/portal-authentication/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body,
      },
      "/api/v2/pe/portal-authentication"
    );

    console.log("✅ Portal token received:", portalResult.data);

    // 4️⃣ Return portal token
    return NextResponse.json(portalResult.data, {
      status: portalResult.status,
    });

  } catch (err: any) {
    console.error("❌ Portal auth route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
