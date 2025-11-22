"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";
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
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50 animate-in fade-in duration-200"
      style={{ backgroundColor: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--panel-elevated)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2 
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Environment Overrides
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: "var(--muted)" }}
            >
              Override environment variables for this session only
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              backgroundColor: "var(--muted-bg)",
              color: "var(--foreground)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--error)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--muted-bg)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: "var(--accent-bg)",
              border: "1px solid var(--accent)",
            }}
          >
            <p 
              className="text-sm"
              style={{ color: "var(--foreground-secondary)" }}
            >
              <strong style={{ color: "var(--accent)" }}>Note:</strong> These values are stored securely in an encrypted HTTP-only cookie and only apply to this browser session. They never leave the server.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIELD_KEYS.map((key) => (
                <div key={key} className="flex flex-col gap-2">
                  <label 
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--muted)" }}
                  >
                    {key}
                  </label>
                  <input
                    type={
                      key === "POLLY_PASSWORD" || key === "POLLY_CLIENT_SECRET"
                        ? "password"
                        : "text"
                    }
                    value={fields[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="w-full"
                    placeholder={`Enter ${key.replace(/_/g, " ").toLowerCase()}`}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid var(--error)",
                  color: "var(--error)",
                }}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={handleClear}
                disabled={submitting}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--muted)" }}
              >
                Reset to defaults
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    border: "1.5px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                    e.currentTarget.style.backgroundColor = "var(--muted-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                    color: "var(--button-text)",
                    boxShadow: "var(--shadow-md)",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                >
                  {submitting ? "Applying…" : "Apply Overrides"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
