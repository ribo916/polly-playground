import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";
import { getEnvValue } from "@/app/lib/getEnvValue";

export async function POST() {
  try {
    // 🔍 Read override-aware Polly environment
    const BASE = await getEnvValue("POLLY_BASE_URL");
    const USER = await getEnvValue("POLLY_USERNAME");
    const PASS = await getEnvValue("POLLY_PASSWORD");
    const CID  = await getEnvValue("POLLY_CLIENT_ID");
    const SEC  = await getEnvValue("POLLY_CLIENT_SECRET");

    console.log("🔧 Effective ENV (example route):", { BASE });

    // 🔐 Build token request
    const tokenBody = new URLSearchParams({
      username: USER ?? "",
      password: PASS ?? "",
      grant_type: "password",
      client_id: CID ?? "",
      client_secret: SEC ?? "",
    });

    // 🔥 DIRECT CALL to Polly — not /api/auth
    const tokenRes = await logFetch(
      `${BASE}/api/v2/auth/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody,
      },
      "/api/v2/auth/token"
    );

    const access_token = tokenRes?.data?.access_token;
    if (!access_token) throw new Error("Missing access token");

    // 📦 Build Polly PE request body
    const body = {
      audienceId: "Retail",
      search: {
        position: "First",
        desiredLockPeriod: 30,
        includeInterestOnlyProducts: false,
        loanTypes: ["Conventional", "FHA", "VA"],
        amortizationTypes: ["ARM", "Fixed"],
        loanTerms: ["360", "180"],
        armFixedTerms: ["84"],
      },
      borrower: {
        fico: 800,
        monthsOfReserves: 6,
        isSelfEmployed: false,
        verificationMethod: "FullDocument",
        creditGrade: "None",
        firstName: "Test",
        lastName: "User",
        annualIncome: 120000,
      },
      loan: {
        purpose: "Purchase",
        amount: 350000,
        purchasePrice: 500000,
        propertyValue: 500000,
        ltv: "71.225",
        cltv: "71.225",
        hcltv: "71.225",
        impounds: "Full",
      },
      property: {
        state: "VA",
        county: "Fairfax",
        propertyType: "SFR",
        occupancy: "PrimaryResidence",
        units: 1,
        addressLine1: "123 Test Sq",
        city: "Vienna",
        countyFipsCode: "059",
        zipCode: "22181",
      },
      settings: {
        operations: ["Eligibility", "Pricing"],
        returnTerseResponse: true,
        returnTerseProductResponse: false,
        returnIneligibleProducts: false,
      },
    };

    // 🧾 Pricing Scenario request
    const res = await logFetch(
      `${BASE}/api/v2/pe/pricing-scenario/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(body),
      },
      "/api/v2/pe/pricing-scenario"
    );

    return NextResponse.json(
      { message: "Pricing Scenario complete", status: res.status },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ Pricing Scenario route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
