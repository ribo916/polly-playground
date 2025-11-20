// /app/loan-pipeline/helpers/payloadBuilder.ts

import {
  FieldDefinition,
  unflattenObject,
  ensureCustomValues,
  sampleValueFromMinimal,
} from "./fieldUtils";

/* =============================================================================
 * buildInitialFormState
 *
 * Creates the initial form state from field definitions:
 *   - Required + NOT NULLABLE fields → include with realistic default values
 *   - Everything else → excluded initially (added when user expands section)
 *
 * This produces a flat map: { "loanNumber": "LN-100001", "cltv": "80.0", ... }
 * ===========================================================================*/

export function buildInitialFormState(
  fieldDefs: FieldDefinition[]
): Record<string, any> {

  // ---------------------------------------------------------------------------
  // Default realistic sample values for required + non-nullable fields
  // Authoritative list (from your initialization prompt)
  // ---------------------------------------------------------------------------
  const DEFAULT_SAMPLES: Record<string, any> = {
    // Loan root
    "loanNumber": "LN-100001",
    "losLoanId": "LOS-100001",
    "amount": "200000.00",
    "ltv": "80.0",
    "cltv": "80.0",
    "hcltv": "80.0",
    "propertyValue": "250000.00",
    "externalCreatedAt": "2025-01-01T00:00:00Z",
    "externalModifiedAt": "2025-01-01T00:00:00Z",
    "purpose": "PURCHASE",

    // Loan officer
    "loanofficer.email": "lo@example.com",
    "loanofficer.name": "Loan Officer",

    // Borrower
    "borrower.lastName": "Doe",
    "borrower.fico": 760,
    "borrower.dtiRatio": "35.0",

    // Property
    "property.county": "Jefferson",
    "property.countyFipsCode": "01101",
    "property.occupancy": "PRIMARY",
    "property.propertyType": "SFR",
    "property.state": "AL",
    "property.stateFipsCode": "01",
    "property.units": 1
  };

  const initial: Record<string, any> = {};

  for (const def of fieldDefs) {
    if (def.isRequired && !def.isNullable) {
      // If we have a known sample, use it
      if (DEFAULT_SAMPLES.hasOwnProperty(def.key)) {
        initial[def.key] = DEFAULT_SAMPLES[def.key];
      } else {
        // Fallback to existing minimal payload or blank
        const fallback = sampleValueFromMinimal(def.key);
        initial[def.key] = fallback ?? "";
      }
    }
  }

  return initial;
}


/* =============================================================================
 * mergeFormIntoPayload
 *
 * Rehydrates the nested request payload from the flat form map.
 *
 * Rules:
 *   - Required + nullable fields → include null if user didn’t fill them
 *   - Optional fields → include only if user filled them
 *   - Always include customValues: {}
 * ===========================================================================*/

export function mergeFormIntoPayload(
  form: Record<string, any>,
  fieldDefs: FieldDefinition[]
): any {

  const workingFlat: Record<string, any> = {};

  for (const def of fieldDefs) {
    const val = form[def.key];

    if (def.isRequired && !def.isNullable) {
      // Always include required + non-nullable
      workingFlat[def.key] = val;
      continue;
    }

    if (def.isRequired && def.isNullable) {
      // Required but nullable → allow null explicitly
      workingFlat[def.key] = val ?? null;
      continue;
    }

    // Optional → include only if user provided a value
    if (val !== undefined && val !== "" && val !== null) {
      workingFlat[def.key] = val;
    }
  }

  // Rebuild nested object
  const payload = unflattenObject(workingFlat);

  // Guarantee customValues is always { }
  ensureCustomValues(payload);

  return payload;
}
