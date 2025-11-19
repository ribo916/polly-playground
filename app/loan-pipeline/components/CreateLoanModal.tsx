"use client";

import { useState } from "react";
import {
  deriveFieldDefinitions,
  humanizeLabel,
} from "../helpers/fieldUtils";
import {
  generateInitialFormFromConfig,
  buildPayloadFromForm,
} from "../helpers/payloadBuilder";
import sample from "@/app/loan-pipeline/data/CreateLoanPayload.json";
import enums from "@/app/loan-pipeline/data/LoanEnumerations.json";
import { createLoanAction } from "../actions/createLoanAction";

// Section map based on parent JSON paths
const SECTION_MAP: Record<string, string> = {
  borrower: "Borrower",
  property: "Property",
  loanofficer: "Loan Officer",
};

function getSectionForField(key: string): string {
  const parts = key.split(".");
  const top = parts[0];
  return SECTION_MAP[top] ?? "Loan";
}

export default function CreateLoanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Build field definitions from swagger + sample
  const fieldDefs = deriveFieldDefinitions(sample, enums);

  // Generate the initial form (only required non-nullable + sample non-null)
  const [form, setForm] = useState<Record<string, any>>(() =>
    generateInitialFormFromConfig(fieldDefs, sample)
  );

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!open) return null;

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  function updateField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);

    const payload = buildPayloadFromForm(fieldDefs, form, sample);
    const res = await createLoanAction(payload);

    setLoading(false);
    setResult(res);

    if (res.ok) {
      setTimeout(() => onClose(), 1200);
    }
  }

  // Group fields into sections
  const sections: Record<string, string[]> = {};
  for (const def of fieldDefs) {
    const section = getSectionForField(def.key);
    if (!sections[section]) sections[section] = [];
    sections[section].push(def.key);
  }

  function shouldShowField(key: string): boolean {
    const section = getSectionForField(key);
    const def = fieldDefs.find((d) => d.key === key);

    if (!def) return false;

    // Required + non-nullable are ALWAYS shown
    if (def.isRequired && !def.isNullable) return true;

    // Required + nullable → shown (visible in first view)
    if (def.isRequired && def.isNullable) return true;

    // Sample has non-null value → show by default
    const sampleFlat = sample; // Already flattened inside fieldDefs
    // BUT we rely on fieldUtils flatten logic → use form: form contains default visible
    if (form[key] !== undefined) return true;

    // Otherwise only if section expanded
    return expandedSections[section] === true;
  }

  function renderField(key: string) {
    const def = fieldDefs.find((d) => d.key === key);
    if (!def) return null;

    const label = humanizeLabel(key);
    const enumInfo = def.enumValues;
    const value = form[key];

    // ENUM → dropdown
    if (enumInfo) {
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm">{label}</label>
          <select
            value={value ?? ""}
            onChange={(e) =>
              updateField(key, e.target.value === "" ? null : e.target.value)
            }
            className="p-2 rounded border"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <option value="">Select…</option>
            {enumInfo.map((opt: string | null) =>
              opt === null ? null : (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              )
            )}
          </select>
        </div>
      );
    }

    // DATE / DATETIME
    if (def.format === "date") {
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm">{label}</label>
          <input
            type="date"
            value={value ?? ""}
            onChange={(e) => updateField(key, e.target.value)}
            className="p-2 rounded border"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          />
        </div>
      );
    }

    if (def.format === "date-time") {
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm">{label}</label>
          <input
            type="datetime-local"
            value={value ?? ""}
            onChange={(e) => updateField(key, e.target.value)}
            className="p-2 rounded border"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          />
        </div>
      );
    }

    // NUMBER (decimal fields)
    const isNumber =
      def.format === "decimal" ||
      (typeof value === "string" && !isNaN(Number(value)));

    return (
      <div key={key} className="flex flex-col gap-1">
        <label className="text-sm">{label}</label>
        <input
          type={isNumber ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) =>
            updateField(key, isNumber ? e.target.value : e.target.value)
          }
          className="p-2 rounded border"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ backdropFilter: "blur(3px)" }}
    >
      <div
        className="p-8 rounded shadow-lg w-[1000px] max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--panel)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-xl font-semibold mb-6">Create Loan</h2>

        {Object.entries(sections).map(([section, keys]) => {
          const visibleKeys = keys.filter((k) => shouldShowField(k));
          const hiddenKeys = keys.filter((k) => !shouldShowField(k));

          return (
            <div key={section} className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{section}</h3>

                {hiddenKeys.length > 0 && (
                  <button
                    onClick={() => toggleSection(section)}
                    className="text-sm underline"
                  >
                    {expandedSections[section]
                      ? "Hide Extra Fields"
                      : `Show ${hiddenKeys.length} More`}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {visibleKeys.map((key) => renderField(key))}
              </div>
            </div>
          );
        })}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: "var(--panel)",
              border: "1px solid var(--border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded font-semibold"
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
          <pre
            className="mt-6 p-4 text-xs rounded"
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
