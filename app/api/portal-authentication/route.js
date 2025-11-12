import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";

export async function POST(request) {
  try {
    const { username } = await request.json();

    // 1️⃣ Log + fetch Bearer token
    const tokenResult = await logFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
      { method: "POST" },
      "/api/auth"
    );

    if (!tokenResult?.data?.access_token) {
      return NextResponse.json(
        { error: "Auth failed" },
        { status: tokenResult.status || 500 }
      );
    }

    const access_token = tokenResult.data.access_token;

    // 2️⃣ Log + fetch portalLoginToken from Polly
    const body = JSON.stringify({ username });
    const portalResult = await logFetch(
      `${process.env.POLLY_BASE_URL}/api/v2/pe/portal-authentication/`,
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

    // 3️⃣ Return to client
    return NextResponse.json(portalResult.data, {
      status: portalResult.status,
    });
  } catch (err) {
    console.error("❌ Portal auth route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
