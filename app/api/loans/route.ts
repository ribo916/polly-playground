import { NextRequest, NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Get access token from /api/auth
    const { data: tokenData } = await logFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
      { method: "POST" },
      "/api/auth"
    );

    const access_token = tokenData?.access_token;
    if (!access_token) {
      throw new Error("Missing access token");
    }

    // Step 2: Get the loan payload from request body
    const payload = await request.json();

    // Step 3: Call Polly API with Bearer token
    const { data: loanData, status, error } = await logFetch(
      `${process.env.POLLY_BASE_URL}/api/v2/pe/loans/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      },
      "/api/v2/pe/loans/"
    );

    if (error) {
      throw new Error(`CreateLoan failed: ${status} – ${error}`);
    }

    if (status && status >= 400) {
      throw new Error(`CreateLoan failed: ${status} – ${JSON.stringify(loanData)}`);
    }

    // Step 4: Return to client
    return NextResponse.json({ ok: true, loan: loanData }, { status });
  } catch (err: any) {
    console.error("❌ Create Loan route error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

