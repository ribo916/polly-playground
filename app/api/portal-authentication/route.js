import { NextResponse } from "next/server";
import { addServerLog } from "../../lib/serverLogStore";

export async function POST(req) {
  const start = Date.now();
  try {
    const { username } = await req.json();

    // STEP 1: Get a bearer token (server-side)
    const authRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, {
      method: "POST",
    });

    const { access_token } = await authRes.json();

    // STEP 2: Call Polly portal-authentication
    const res = await fetch(`${process.env.POLLY_BASE_URL}/api/v2/pe/portal-authentication/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    // ✅ Log success to memory
    addServerLog({
      endpoint: "/api/portal-authentication",
      method: "POST",
      status: res.status,
      duration: Date.now() - start,
      request: { username },
      response: data,
    });

    return NextResponse.json(data);
  } catch (err) {
    // ❌ Log failure to memory
    addServerLog({
      endpoint: "/api/portal-authentication",
      method: "POST",
      error: err.message,
    });

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
