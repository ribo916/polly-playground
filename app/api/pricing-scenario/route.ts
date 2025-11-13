import { NextResponse } from "next/server";
import { logFetch } from "../../../utils/logFetch";

export async function POST() {
  try {
    // Step 1: Get access token from /api/auth
    const tokenRes = await logFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, { method: "POST" }, "/api/auth");
    const access_token = tokenRes?.data?.access_token;
    if (!access_token) throw new Error("Missing access token");

    // Step 2: Build body
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

    // Step 3: Call Polly API
    const res = await logFetch(`${process.env.POLLY_BASE_URL}/api/v2/pe/pricing-scenario/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    }, "/api/v2/pe/pricing-scenario");

    // Step 4: Return short confirmation
    return NextResponse.json({ message: "Pricing Scenario complete", status: res.status });
  } catch (err: any) {
    console.error("❌ Pricing Scenario route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
