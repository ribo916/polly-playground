"use client";
import { useState } from "react";
import { useLogs } from "../context/LogContext";

export default function Page() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { addLog } = useLogs();

  async function runExample() {
    const start = Date.now();
    try {
      setLoading(true);
      const res = await fetch("/api/example");
      const data = await res.json();

      setResult(data);

      addLog({
        endpoint: "/api/example",
        method: "GET",
        status: res.status,
        duration: Date.now() - start,
        response: data,
      });
    } catch (err: any) {
      addLog({
        endpoint: "/api/example",
        method: "GET",
        error: err.message,
      });
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
        className="px-4 py-2 rounded font-medium transition-colors"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--button-text)",
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
