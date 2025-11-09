import { NextResponse } from "next/server";

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

    const response = await fetch(
      `${process.env.POLLY_BASE_URL}/api/v2/auth/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    console.log("🔹 Response status:", response.status);

    const data = await response.json();
    console.log("🔹 Response body:", data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Auth route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
