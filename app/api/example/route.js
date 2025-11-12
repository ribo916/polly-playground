import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";

export async function GET() {
  try {
    // Step 1: get auth token (using logFetch)
    const { data: tokenData } = await logFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
      { method: "POST" },
      "/api/auth"
    );

    const access_token = tokenData?.access_token;
    if (!access_token) {
      throw new Error("Missing access token");
    }

    // Step 2: call Polly API with Bearer token
    const { data: usersData, status } = await logFetch(
      `${process.env.POLLY_BASE_URL}/api/v2/pe/users/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
      "/api/v2/pe/users/"
    );

    // Step 3: return to UI
    return NextResponse.json(usersData, { status });
  } catch (err) {
    console.error("❌ Example route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
