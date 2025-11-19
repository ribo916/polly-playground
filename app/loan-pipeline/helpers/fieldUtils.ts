// /app/loan-pipeline/helpers/fieldUtils.ts

/* =============================================================================
 * Types
 * ========================================================================== */

export interface FieldDefinition {
  key: string;              // e.g. "borrower.firstName"
  isRequired: boolean;      // top-level swagger required keys only
  isNullable: boolean;      // sample value === null
  format?: string | null;   // "decimal", "date", "date-time"
  enumValues?: (string | null)[] | null;
}

/* =============================================================================
 * flattenObject
 * ========================================================================== */

export function flattenObject(
  obj: Record<string, any>,
  prefix = ""
): Record<string, any> {
  const out: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      Object.assign(out, flattenObject(value, full));
    } else {
      out[full] = value;
    }
  }

  return out;
}

/* =============================================================================
 * unflattenObject
 * ========================================================================== */

export function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const root: any = {};

  for (const [key, val] of Object.entries(flat)) {
    const parts = key.split(".");
    let curr = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!curr[p]) curr[p] = {};
      curr = curr[p];
    }

    curr[parts[parts.length - 1]] = val;
  }

  return root;
}

/* =============================================================================
 * ensureCustomValues
 * ========================================================================== */

export function ensureCustomValues(obj: Record<string, any>) {
  if (obj["customValues"] === undefined || obj["customValues"] === null) {
    obj["customValues"] = {};
  }
}

/* =============================================================================
 * humanizeLabel (Pascal Case, only the last segment)
 * ========================================================================== */

export function humanizeLabel(key: string): string {
  const last = key.split(".").pop() || key;
  return last
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/* =============================================================================
 * deriveFieldDefinitions
 *
 * The corrected part is the REQUIRED logic:
 *
 * ❌ Before (bug):
 *    All nested keys under borrower/property/loanofficer were required.
 *
 * ✅ After (correct):
 *    Only top-level swagger-required keys are required.
 *    Nested fields are NEVER required.
 *
 * ========================================================================== */

export function deriveFieldDefinitions(
  sample: Record<string, any>,
  enumMap: Record<string, any>
): FieldDefinition[] {
  const flatSample = flattenObject(sample);

  // Match EXACT swagger top-level required list
  const requiredTopLevel: string[] = [
    "amortizationType",
    "amount",
    "aus",
    "borrower",
    "cashOutAmount",
    "cltv",
    "customValues",
    "documentationType",
    "externalCreatedAt",
    "externalModifiedAt",
    "fhaTotalLoanAmount",
    "fundedAt",
    "hcltv",
    "helocDrawAmount",
    "helocLineAmount",
    "impoundType",
    "isMortgageInsurancePaidByBorrower",
    "isRelocationLoan",
    "isSecondCommunityLoan",
    "isSecondInvestorSameAsFirst",
    "isSecondPiggyback",
    "lenderFee",
    "loanNumber",
    "loanTerm",
    "loanType",
    "loanofficer",
    "losLoanId",
    "ltv",
    "position",
    "prepaymentPenaltyPeriodMonths",
    "productCode",
    "productName",
    "property",
    "propertyValue",
    "purchasePrice",
    "purpose",
    "rate",
    "refinancePurpose",
    "rollLenderFee",
    "secondAmount",
    "temporaryBuydownType",
    "usdaTotalLoanAmount",
    "vaTotalLoanAmount",
  ];

  const swaggerRequired = new Set(requiredTopLevel);

  // Grab enum values from LoanEnumerations.json
  const enumLookup: Record<string, (string | null)[] | null> = {};
  for (const [k, v] of Object.entries(enumMap)) {
    if (v.enum) enumLookup[k] = v.enum;
  }

  const defs: FieldDefinition[] = [];

  for (const key of Object.keys(flatSample)) {
    const rawValue = flatSample[key];
    const last = key.split(".").pop()!;

    // ------------------------------------------
    // HERE IS THE FIX:
    // A field is required ONLY if:
    // - it is TOP-LEVEL (no dot)
    // - AND its name is in swagger's required list
    // ------------------------------------------
    const isTopLevel = !key.includes(".");
    const isRequired =
      isTopLevel && swaggerRequired.has(key); // use full key (e.g., "borrower")

    // Enum detection
    const enumValues =
      enumLookup[key] ?? enumLookup[last] ?? null;

    // Format detection for sample values
    let format: string | null = null;
    if (typeof rawValue === "string") {
      if (rawValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        format = "date";
      } else if (rawValue.includes("T")) {
        format = "date-time";
      } else if (!isNaN(Number(rawValue))) {
        format = "decimal";
      }
    }

    defs.push({
      key,
      isRequired,
      isNullable: rawValue === null,
      enumValues,
      format,
    });
  }

  return defs;
}
