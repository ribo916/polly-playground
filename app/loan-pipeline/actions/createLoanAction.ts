/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

export async function createLoanAction(payload: any) {
  try {
    // Use full URL if available, otherwise use relative (works in Next.js server actions)
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/loans`
      : "/api/loans";
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || `CreateLoan failed: ${res.status}`);
    }
    
    return data;
  } catch (err: any) {
    console.error("❌ createLoanAction error", err);
    return { ok: false, error: err.message };
  }
}
