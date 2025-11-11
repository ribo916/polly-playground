import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("🔹 Starting portal authentication request...");

    // 1️⃣ Get a bearer token from your local /api/auth route
    const authRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, {
      method: "POST",
    });

    if (!authRes.ok) {
      throw new Error(`Auth request failed: ${authRes.status}`);
    }

    const { access_token } = await authRes.json();
    if (!access_token) {
      throw new Error("Missing access token from /api/auth response");
    }

    // 2️⃣ Parse incoming body (expected: { username })
    const { username } = await req.json();
    if (!username) {
      throw new Error("Missing username in request body");
    }

    // 3️⃣ Call Polly’s portal-authentication endpoint
    const response = await fetch(
      `${process.env.POLLY_BASE_URL}/api/v2/pe/portal-authentication/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ username }),
      }
    );

    console.log("🔹 Portal auth response status:", response.status);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || `Portal auth failed: ${response.status}`);
    }

    // 4️⃣ Return the portalLoginToken to the client
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Portal-auth route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
