import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Determine the correct base URL (works locally and on Vercel)
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`;

    // 1️⃣ Get a token from your own auth route
    const tokenRes = await fetch(`${baseUrl}/api/auth`, { method: "POST" });
    if (!tokenRes.ok) {
      throw new Error(`Auth route failed: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error("No access_token returned from auth");

    // 2️⃣ Call Polly API with that token
    const apiRes = await fetch(
      `${process.env.POLLY_BASE_URL}/api/v2/pe/users/?page_number=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    if (!apiRes.ok) {
      throw new Error(`Polly API failed: ${apiRes.status}`);
    }

    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Example route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
