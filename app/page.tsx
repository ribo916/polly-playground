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
      <p className="text-gray-400">
        Run a live call to the <code>/pe/users</code> endpoint.
      </p>

      <button
        onClick={runExample}
        className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Running..." : "Run Example"}
      </button>

      {result && (
        <pre className="mt-4 bg-gray-800 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
