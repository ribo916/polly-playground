"use client";

import { useState, FormEvent } from "react";
import { applyOverrides } from "@/app/actions/envOverridesAction";
import { clearOverrides } from "@/app/actions/clearOverridesAction";

type Props = {
  onClose: () => void;
};

const FIELD_KEYS = [
  "POLLY_BASE_URL",
  "ORG_TICKER",
  "POLLY_USERNAME",
  "POLLY_PASSWORD",
  "POLLY_CLIENT_ID",
  "POLLY_CLIENT_SECRET",
] as const;

type FieldKey = (typeof FIELD_KEYS)[number];

type FieldState = Record<FieldKey, string>;

export function EnvOverrideModal({ onClose }: Props) {
  const [fields, setFields] = useState<FieldState>({
    POLLY_BASE_URL: "",
    ORG_TICKER: "",
    POLLY_USERNAME: "",
    POLLY_PASSWORD: "",
    POLLY_CLIENT_ID: "",
    POLLY_CLIENT_SECRET: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: FieldKey, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await applyOverrides(fields);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to apply overrides");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClear() {
    setSubmitting(true);
    setError(null);

    try {
      await clearOverrides();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to clear overrides");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: "var(--overlay)" }}
    >
      <div
        className="w-[520px] max-w-full rounded border shadow-lg p-6"
        style={{
          backgroundColor: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">
          Polly Session Overrides
        </h2>

        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          These values temporarily override your Polly environment **for this browser session only**.
          Values are stored securely on the server and are never accessible to browser code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {FIELD_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium">{key}</label>
              <input
                type={
                  key === "POLLY_PASSWORD" || key === "POLLY_CLIENT_SECRET"
                    ? "password"
                    : "text"
                }
                value={fields[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="border rounded p-2 text-sm"
                style={{
                  backgroundColor: "var(--panel)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                autoComplete="off"
              />
            </div>
          ))}

          {error && (
            <p className="text-xs mt-2" style={{ color: "red" }}>
              {error}
            </p>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleClear}
              disabled={submitting}
              className="text-xs underline"
              style={{ color: "var(--muted)" }}
            >
              Reset to default env
            </button>

            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-3 py-1 rounded border text-sm"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--panel)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1 rounded text-sm font-medium transition"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--button-text)",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Applying…" : "Apply Overrides"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
