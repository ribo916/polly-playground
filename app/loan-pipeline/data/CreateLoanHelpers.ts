// app/loan-pipeline/data/CreateLoanHelpers.ts

import { createLoanFieldDefinitions, FieldDefinition } from "./CreateLoanFieldConfig";
import sample from "@/app/loan-pipeline/data/CreateLoanPayload.json";

/**
 * Utility: Convert "borrower.firstName" => nested object structure
 * Used in merging sample and building final payload.
 */
export function unflattenFormData(flatData: Record<string, any>): any {
  const nested: any = {};

  for (const [key, value] of Object.entries(flatData)) {
    const parts = key.split(".");
    let current = nested;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  return nested;
}

/**
 * Utility: Flatten nested sample to allow merging + filling
 */
export function flatten(obj: any, prefix = "", result: Record<string, any> = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      flatten(value, fullKey, result);
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Create the initial form values.
 *
 * RULES:
 * - Required (non-nullable) fields get placeholder values if they exist.
 * - Required nullable fields start as null.
 * - Optional fields do NOT appear unless the user opens "Show optional".
 * - Nested borrower/property/loanofficer fields come from sample.
 */
export function generateInitialFormFromConfig() {
  const flatSample = flatten(sample);

  const form: Record<string, any> = {};

  for (const field of createLoanFieldDefinitions) {
    const { key, group, placeholder, nullable } = field;

    // If this is an object (borrower, property, loanofficer), skip it
    // All nested fields come from sample.json and will be editable in modal.
    if (field.type === "object") continue;

    if (group === "required") {
      form[key] = placeholder ?? flatSample[key] ?? "";
    } else if (group === "requiredNullable") {
      // Required-nullable always appears but may be null
      form[key] = flatSample[key] ?? null;
    }
    // Optional: do not add yet. Only added if user opens optional UI.
  }

  // Include nested borrower/property/loanofficer values from sample:
  for (const [k, v] of Object.entries(flatSample)) {
    if (k.startsWith("borrower.") || k.startsWith("property.") || k.startsWith("loanofficer.")) {
      if (v === null) form[k] = null;
      else form[k] = v;
    }
  }

  return form;
}

/**
 * Build the final payload before sending to the API.
 *
 * RULES:
 * - Required (non-nullable): must have a value.
 * - Required nullable: must be included, but value may be null.
 * - Optional: included ONLY if provided by user.
 */
export function buildPayloadFromForm(
  form: Record<string, any>,
  includeOptional: boolean
) {
  const flatSample = flatten(sample);
  const flatPayload: Record<string, any> = {};

  for (const def of createLoanFieldDefinitions) {
    const { key, group, nullable } = def;

    const hasValue = form[key] !== undefined && form[key] !== "";
    const value = hasValue ? form[key] : null;

    if (group === "required") {
      flatPayload[key] = form[key]; // required & non-nullable
    } else if (group === "requiredNullable") {
      flatPayload[key] = value; // required & nullable
    } else if (group === "optional") {
      if (includeOptional && hasValue) {
        flatPayload[key] = value;
      }
    }
  }

  // Include borrower/property/loanofficer (nested object structure)
  for (const [k, v] of Object.entries(form)) {
    if (k.startsWith("borrower.") || k.startsWith("property.") || k.startsWith("loanofficer.")) {
      const hasValue = v !== undefined && v !== "";
      if (hasValue) flatPayload[k] = v;
    }
  }

  // Convert flat payload to nested object
  const nested = unflattenFormData(flatPayload);

  return nested;
}
