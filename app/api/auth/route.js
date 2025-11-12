// app/api/auth/route.js
import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";

export async function POST() {
  try {
    console.log("🔹 Starting token request...");

    const body = new URLSearchParams({
      username: process.env.POLLY_USERNAME,
      password: process.env.POLLY_PASSWORD,
      grant_type: "password",
      client_id: process.env.POLLY_CLIENT_ID,
      client_secret: process.env.POLLY_CLIENT_SECRET,
    });

    // ✅ use logFetch so it’s captured in serverLogStore
    const tokenResult = await logFetch(
      `${process.env.POLLY_BASE_URL}/api/v2/auth/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
      "/api/v2/auth/token"
    );

    console.log("🔹 Response status:", tokenResult.status);
    console.log("🔹 Response body:", tokenResult.data);

    return NextResponse.json(tokenResult.data, { status: tokenResult.status });
  } catch (err) {
    console.error("❌ Auth route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
