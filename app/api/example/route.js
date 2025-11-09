import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Request a fresh access token from your local /api/auth route
    const tokenRes = await fetch("http://localhost:3001/api/auth", {
      method: "POST",
    });
    const { access_token } = await tokenRes.json();

    // 2. Use that token to call Polly’s API
    const apiRes = await fetch(
      `${process.env.POLLY_BASE_URL}/api/v2/pe/users/?page_number=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    // 3. Return Polly’s data to the frontend
    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Example route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
