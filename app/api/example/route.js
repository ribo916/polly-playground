import { NextResponse } from "next/server";
import { addServerLog } from "../../lib/serverLogStore";

export async function GET() {
  const start = Date.now();

  try {
    // STEP 1 — Request an access token
    const authRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, {
      method: "POST",
    });
    const { access_token } = await authRes.json();

    // STEP 2 — Call Polly’s users endpoint
    const res = await fetch(`${process.env.POLLY_BASE_URL}/api/v2/pe/users/?page_number=1`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = await res.json();

    // ✅ Log success
    addServerLog({
      endpoint: "/api/example",
      method: "GET",
      status: res.status,
      duration: Date.now() - start,
      request: {}, // optional if no body
      response: data,
    });

    return NextResponse.json(data);
  } catch (err) {
    // ❌ Log failure
    addServerLog({
      endpoint: "/api/example",
      method: "GET",
      error: err.message,
    });

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
