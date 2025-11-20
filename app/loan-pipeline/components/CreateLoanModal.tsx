"use client";

import { useState } from "react";

import {
  deriveFieldDefinitions,
  humanizeLabel,
} from "../helpers/fieldUtils";

import {
  buildInitialFormState,
  mergeFormIntoPayload,
} from "../helpers/payloadBuilder";

import enums from "../data/LoanEnumerations.json";
import sample from "../data/CreateLoanPayload.json";

// UI helpers
function SectionToggle({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="text-sm text-blue-500 hover:underline mb-1"
    >
      {expanded ? `Hide ${title} Fields` : `Show More ${title} Fields`}
    </button>
  );
}

export default function CreateLoanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  // Derive all metadata
  const fieldDefs = deriveFieldDefinitions(sample, enums);

  // Partition into sections
  const loanFields = fieldDefs.filter(
    (f) =>
      !f.key.startsWith("borrower.") &&
      !f.key.startsWith("property.") &&
      !f.key.startsWith("loanofficer.")
  );

  const borrowerFields = fieldDefs.filter((f) =>
    f.key.startsWith("borrower.")
  );

  const propertyFields = fieldDefs.filter((f) =>
    f.key.startsWith("property.")
  );

  const loanOfficerFields = fieldDefs.filter((f) =>
    f.key.startsWith("loanofficer.")
  );

  // Required initial defaults only
  const initialForm = buildInitialFormState(fieldDefs);

  const [form, setForm] = useState<Record<string, any>>(initialForm);

  // Expand state per section
  const [loanExpanded, setLoanExpanded] = useState(false);
  const [borrowerExpanded, setBorrowerExpanded] = useState(false);
  const [propertyExpanded, setPropertyExpanded] = useState(false);
  const [loanOfficerExpanded, setLoanOfficerExpanded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  function updateField(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    setLoading(true);

    const payload = mergeFormIntoPayload(form, fieldDefs);

    // Correct route
    const res = await fetch("/api/loans", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    setLoading(false);
    setResult(json);

    if (json?.ok) {
      setTimeout(() => onClose(), 1200);
    }
  }

  /* --------------------------------------------
   * Field Rendering
   * -------------------------------------------- */
  function renderField(def: any) {
    const value = form[def.key] ?? "";

    if (def.isObject) return null;

    // ENUM FIELD — always renders select when enumValues exist
    if (def.enumValues && Array.isArray(def.enumValues)) {
      const cleanedEnum = def.enumValues.filter((v: any) => v !== null);

      return (
        <div key={def.key} className="flex flex-col">
          <label className="text-xs font-medium mb-1">
            {humanizeLabel(def.key)}
            {def.isRequired && !def.isNullable ? " *" : ""}
          </label>

          <select
            value={value}
            onChange={(e) => updateField(def.key, e.target.value)}
            className="border rounded p-2 bg-background text-foreground"
          >
            {!def.isRequired || def.isNullable ? (
              <option value="">Select…</option>
            ) : null}
            {cleanedEnum.map((v: any) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Date-only
    if (def.format === "date") {
      return (
        <div key={def.key} className="flex flex-col">
          <label className="text-xs font-medium mb-1">
            {humanizeLabel(def.key)}
            {def.isRequired && !def.isNullable ? " *" : ""}
          </label>

          <input
            type="date"
            value={value}
            onChange={(e) => updateField(def.key, e.target.value)}
            className="border rounded p-2 bg-background text-foreground"
          />
        </div>
      );
    }

    // Date-time
    if (def.format === "date-time") {
      return (
        <div key={def.key} className="flex flex-col">
          <label className="text-xs font-medium mb-1">
            {humanizeLabel(def.key)}
            {def.isRequired && !def.isNullable ? " *" : ""}
          </label>

          <input
            type="datetime-local"
            value={value.replace("Z", "")}
            onChange={(e) =>
              updateField(def.key, e.target.value + "Z")
            }
            className="border rounded p-2 bg-background text-foreground"
          />
        </div>
      );
    }

    // Numeric
    if (def.format === "decimal") {
      return (
        <div key={def.key} className="flex flex-col">
          <label className="text-xs font-medium mb-1">
            {humanizeLabel(def.key)}
            {def.isRequired && !def.isNullable ? " *" : ""}
          </label>

          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => updateField(def.key, e.target.value)}
            className="border rounded p-2 bg-background text-foreground"
          />
        </div>
      );
    }

    // Text default
    return (
      <div key={def.key} className="flex flex-col">
        <label className="text-xs font-medium mb-1">
          {humanizeLabel(def.key)}
          {def.isRequired && !def.isNullable ? " *" : ""}
        </label>

        <input
          type="text"
          value={value}
          onChange={(e) => updateField(def.key, e.target.value)}
          className="border rounded p-2 bg-background text-foreground"
        />
      </div>
    );
  }

  /* --------------------------------------------
   * Section Utility
   * -------------------------------------------- */
  function sectionFields(defs: any[], expanded: boolean) {
    return defs.filter((f) =>
      expanded ? true : f.isRequired && !f.isNullable
    );
  }

  /* --------------------------------------------
   * Layout
   * -------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
      <div className="p-6 rounded shadow-lg w-[800px] max-h-[90vh] overflow-y-auto bg-panel text-foreground border border-border">

        <h2 className="text-lg font-semibold mb-4">Create Loan</h2>

        {/* Loan Section */}
        <h3 className="font-semibold text-md mt-4 mb-2">Loan</h3>
        <SectionToggle
          title="Loan"
          expanded={loanExpanded}
          onToggle={() => setLoanExpanded(!loanExpanded)}
        />
        <div className="grid grid-cols-2 gap-4">
          {sectionFields(loanFields, loanExpanded).map(renderField)}
        </div>

        {/* Loan Officer */}
        <h3 className="font-semibold text-md mt-6 mb-2">Loan Officer</h3>
        <SectionToggle
          title="Loan Officer"
          expanded={loanOfficerExpanded}
          onToggle={() => setLoanOfficerExpanded(!loanOfficerExpanded)}
        />
        <div className="grid grid-cols-2 gap-4">
          {sectionFields(loanOfficerFields, loanOfficerExpanded).map(renderField)}
        </div>

        {/* Borrower */}
        <h3 className="font-semibold text-md mt-6 mb-2">Borrower</h3>
        <SectionToggle
          title="Borrower"
          expanded={borrowerExpanded}
          onToggle={() => setBorrowerExpanded(!borrowerExpanded)}
        />
        <div className="grid grid-cols-2 gap-4">
          {sectionFields(borrowerFields, borrowerExpanded).map(renderField)}
        </div>

        {/* Property */}
        <h3 className="font-semibold text-md mt-6 mb-2">Property</h3>
        <SectionToggle
          title="Property"
          expanded={propertyExpanded}
          onToggle={() => setPropertyExpanded(!propertyExpanded)}
        />
        <div className="grid grid-cols-2 gap-4">
          {sectionFields(propertyFields, propertyExpanded).map(renderField)}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded font-medium transition border border-border"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)"
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded font-medium transition"
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
          <pre className="mt-4 text-xs whitespace-pre-wrap p-2 rounded bg-background border border-border">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
