"use client";
import { useState } from "react";

export default function Page() {
  // Allow result to hold anything (JSON, string, error object, etc.)
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runExample() {
    try {
      setLoading(true);
      const res = await fetch("/api/example");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      // err is unknown by default in TS, so declare type and assign
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <p style={{ color: "var(--muted)" }}>
        Run a live call to the <code>/pe/users</code> endpoint.
      </p>

      <button
        onClick={runExample}
        className="px-4 py-2 rounded font-medium transition-colors duration-200"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--button-text)",        // ✅ uses global per-theme text color
          cursor: loading ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent)";
        }}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Example"}
      </button>

      {result && (
        <pre
          className="mt-4 p-4 rounded text-sm overflow-x-auto"
          style={{
            backgroundColor: "var(--panel)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
