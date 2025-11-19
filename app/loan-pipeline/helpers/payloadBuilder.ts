// /app/loan-pipeline/helpers/payloadBuilder.ts

import {
  FieldDefinition,
  flattenObject,
  unflattenObject,
  ensureCustomValues,
} from "./fieldUtils";

/* =============================================================================
 * REALISTIC DEFAULTS (ONLY for top-level required & NOT nullable fields)
 * =============================================================================
 */

const REQUIRED_DEFAULTS: Record<string, any> = {
  amortizationType: "FIXED",
  amount: "350000.00",
  aus: "NONE",
  cashOutAmount: "0.00",
  cltv: "80.00",
  documentationType: "FULL_DOCUMENTATION",
  externalCreatedAt: new Date().toISOString(),
  externalModifiedAt: new Date().toISOString(),
  fhaTotalLoanAmount: "0.00",
  hcltv: "80.00",
  helocDrawAmount: "0.00",
  helocLineAmount: "0.00",
  impoundType: "NONE",
  isMortgageInsurancePaidByBorrower: false,
  isRelocationLoan: false,
  isSecondCommunityLoan: false,
  isSecondInvestorSameAsFirst: false,
  isSecondPiggyback: false,
  lenderFee: "0.00",
  loanNumber: "LN-10001",
  loanTerm: 360,
  loanType: "CONVENTIONAL",
  losLoanId: "LOS-10001",
  ltv: "80.00",
  position: "FIRST",
  prepaymentPenaltyPeriodMonths: 0,
  productCode: "TESTCODE",
  productName: "Test Product",
  propertyValue: "400000.00",
  purchasePrice: "400000.00",
  purpose: "PURCHASE",
  rate: "6.500",
  refinancePurpose: "NONE",
  rollLenderFee: false,
  secondAmount: "0.00",
  temporaryBuydownType: "NONE",
  usdaTotalLoanAmount: "0.00",
  vaTotalLoanAmount: "0.00",
};

/* =============================================================================
 * generateInitialFormFromConfig()
 *
 * - Required non-nullable → ALWAYS set realistic default
 * - Required nullable → leave blank (user can fill, payload sends null)
 * - Optional → include only if sample has a non-null value
 =============================================================================
 */

export function generateInitialFormFromConfig(
  fieldDefs: FieldDefinition[],
  sample: Record<string, any>
): Record<string, any> {
  const flatSample = flattenObject(sample);
  const form: Record<string, any> = {};

  for (const def of fieldDefs) {
    const { key, isRequired, isNullable } = def;
    const topLevelKey = key.split(".")[0];

    // REQUIRED + NOT NULLABLE
    if (isRequired && !isNullable && !key.includes(".")) {
      form[key] = REQUIRED_DEFAULTS[topLevelKey] ?? "";
      continue;
    }

    // REQUIRED + NULLABLE (leave blank → payload will send null)
    if (isRequired && isNullable && !key.includes(".")) {
      form[key] = "";
      continue;
    }

    // Optional fields → include only if sample has non-null scalar
    const sampleValue = flatSample[key];
    if (sampleValue !== null && sampleValue !== undefined) {
      if (typeof sampleValue !== "object") {
        form[key] = sampleValue;
      }
    }
  }

  ensureCustomValues(form);
  return form;
}

/* =============================================================================
 * buildPayloadFromForm()
 *
 * - NO DEFAULTS applied here (UI already populated)
 * - Required nullable → send null if blank
 * - Optional → send only if user entered something
 =============================================================================
 */

export function buildPayloadFromForm(
  fieldDefs: FieldDefinition[],
  form: Record<string, any>,
  sample: Record<string, any>
): Record<string, any> {
  const flatOut: Record<string, any> = {};

  for (const def of fieldDefs) {
    const { key, isRequired, isNullable } = def;
    const userVal = form[key];

    // REQUIRED NON-NULLABLE → userVal must already be filled in UI
    if (isRequired && !isNullable) {
      flatOut[key] = userVal;
      continue;
    }

    // REQUIRED NULLABLE → allow null
    if (isRequired && isNullable) {
      flatOut[key] = userVal === "" ? null : userVal;
      continue;
    }

    // OPTIONAL
    if (userVal !== undefined) {
      flatOut[key] = userVal;
    }
  }

  ensureCustomValues(flatOut);
  return unflattenObject(flatOut);
}
