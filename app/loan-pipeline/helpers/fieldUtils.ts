// /app/loan-pipeline/helpers/fieldUtils.ts

export interface FieldDefinition {
  key: string;
  isRequired: boolean;
  isNullable: boolean;
  enumValues?: (string | null)[] | null;
  format?: "date" | "date-time" | "decimal" | null;
  isObject?: boolean;
}

import minimal from "../data/CreateLoanPayload.json";

/**
 * Pulls a field's value from the minimal payload.
 */
export function sampleValueFromMinimal(key: string): any {
  const parts = key.split(".");
  let ref: any = minimal;

  for (const p of parts) {
    if (ref == null || typeof ref !== "object") return null;
    ref = ref[p];
  }
  return ref;
}

/**
 * Returns true if a value is a plain object (not an array).
 */
function isPlainObject(val: any) {
  return val && typeof val === "object" && !Array.isArray(val);
}

/**
 * Humanize labels like "borrower.lastName" → "Borrower Last Name"
 */
export function humanizeLabel(key: string): string {
  const parts = key.split(".");
  const last = parts[parts.length - 1];

  return last
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * ---------------------------------------------------------------------------
 * deriveFieldDefinitions()
 *
 * Creates a flat list of FieldDefinition entries for every field
 * in both the minimal sample payload AND enum metadata.
 *
 * Fix for Bug #5:
 * - If enums metadata contains a key, we ALWAYS treat it as an enum field,
 *   regardless of sample value.
 * ---------------------------------------------------------------------------
 */
export function deriveFieldDefinitions(
  sample: any,
  enums: Record<string, any>
): FieldDefinition[] {
  const defs: FieldDefinition[] = [];

  function walk(prefix: string, obj: any) {
    if (!isPlainObject(obj)) return;

    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      const enumInfo = enums[key] || enums[fullKey] || null;

      const isObject = isPlainObject(value);

      // Detect nullability: null in sample ⇒ nullable
      const isNullable = value === null;

      // True "required" based on minimal payload (null allowed if required+nullable)
      const isRequired = value !== undefined;

      let format: "date" | "date-time" | "decimal" | null = null;

      if (typeof value === "string") {
        if (/\d{4}-\d{2}-\d{2}T/.test(value)) format = "date-time";
        else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) format = "date";
        else if (/^-?\d+\.\d+$/.test(value)) format = "decimal";
      }

      defs.push({
        key: fullKey,
        isRequired,
        isNullable,
        enumValues: enumInfo?.enum ?? null,
        format,
        isObject,
      });

      // Recurse if nested
      if (isObject) walk(fullKey, value);
    }
  }

  walk("", sample);

  return defs;
}

/**
 * Convert flattened key-value map to nested object.
 */
export function unflattenObject(flat: Record<string, any>): any {
  const result: any = {};

  for (const key of Object.keys(flat)) {
    const parts = key.split(".");
    let node = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        node[part] = flat[key];
      } else {
        node[part] = node[part] || {};
        node = node[part];
      }
    }
  }

  return result;
}

/**
 * Enforces presence of customValues on final payload.
 */
export function ensureCustomValues(payload: any) {
  if (!payload.customValues) payload.customValues = {};
}
