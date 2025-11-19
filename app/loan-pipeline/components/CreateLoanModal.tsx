/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { createLoanAction } from "../actions/createLoanAction";

// Load JSON directly from public or embed it
import sample from "@/app/loan-pipeline/data/CreateLoanPayload.json";
import enums from "@/app/loan-pipeline/data/LoanEnumerations.json";

interface CreateLoanModalProps {
  open: boolean;
  onClose: () => void;
}

// Helper function to extract all non-null fields (including nested objects)
function extractNonNullFields(obj: Record<string, unknown>, prefix = ""): Record<string, string | number | boolean> {
  const fields: Record<string, string | number | boolean> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null) {
      continue; // Skip null fields
    }
    
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      // Recursively extract non-null fields from nested objects
      const nestedFields = extractNonNullFields(value as Record<string, unknown>, fullKey);
      // Only add nested fields if there are any (skip empty objects like customValues: {})
      if (Object.keys(nestedFields).length > 0) {
        Object.assign(fields, nestedFields);
      }
      // Empty objects will be included in the final payload via mergeWithSample
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      fields[fullKey] = value;
    }
  }
  
  return fields;
}

// Helper function to merge form data with all sample fields (including null ones)
function mergeWithSample(nestedFormData: any, sampleData: any): any {
  const merged: any = {};
  
  // First, copy all fields from sample (including null ones)
  for (const [key, value] of Object.entries(sampleData)) {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      // Handle nested objects - recursively merge
      merged[key] = mergeWithSample(
        nestedFormData[key] || {},
        value as any
      );
    } else {
      // Use form value if it exists, otherwise use sample value (which might be null)
      merged[key] = nestedFormData[key] !== undefined ? nestedFormData[key] : value;
    }
  }
  
  return merged;
}

// Helper function to convert flat form data to nested structure
function unflattenFormData(flatData: any): any {
  const nested: any = {};
  
  for (const [key, value] of Object.entries(flatData)) {
    const parts = key.split(".");
    let current = nested;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return nested;
}

export default function CreateLoanModal({ open, onClose }: CreateLoanModalProps) {
  const [form, setForm] = useState(() => {
    // Extract all non-null fields from sample (including nested)
    return extractNonNullFields(sample);
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!open) return null;

  function updateField(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    
    // Convert flat form data to nested structure
    const nestedForm = unflattenFormData(form);
    
    // Merge with sample to include all fields (including null ones)
    const payload = mergeWithSample(nestedForm, sample);
    
    const res = await createLoanAction(payload);
    setLoading(false);
    setResult(res);
    if (res.ok) {
      setTimeout(() => onClose(), 1200);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ backdropFilter: "blur(3px)" }}
    >
      <div
        className="p-6 rounded shadow-lg w-[600px] max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--panel)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Create Loan</h2>

        <div className="space-y-4">
          {Object.entries(form).map(([key, value]) => {
            // Check if this field has an enum definition (check both full key and last part for nested keys)
            const keyParts = key.split(".");
            const baseKey = keyParts[keyParts.length - 1];
            const enumInfo = (enums as any)[key] || (enums as any)[baseKey];

            if (enumInfo?.enum) {
              // Ensure value is a string for select
              const selectValue = value != null && typeof value !== "object" ? String(value) : "";
              
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-sm mb-1">{key}</label>
                  <select
                    value={selectValue}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="p-2 rounded border"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="">Select…</option>
                    {enumInfo.enum.filter((x: string | null) => x !== null).map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // Determine input type based on field name or value type
            const inputType = 
              key.toLowerCase().includes("email") ? "email" :
              (typeof value === "number" || (typeof value === "string" && !isNaN(Number(value)) && value.includes("."))) ? "number" :
              "text";

            // Convert value to string for display (handle numbers, objects, etc.)
            const displayValue = value != null && typeof value !== "object" ? String(value) : "";

            return (
              <div key={key} className="flex flex-col">
                <label className="text-sm mb-1">{key}</label>
                <input
                  type={inputType}
                  value={displayValue}
                  onChange={(e) => updateField(key, inputType === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                  className="p-2 rounded border"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded font-medium"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--button-text)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Creating…" : "Create Loan"}
          </button>
        </div>

        {result && (
          <pre className="mt-4 text-xs whitespace-pre-wrap p-2 rounded"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
