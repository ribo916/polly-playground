"use client";
import { useState } from "react";

export default function ApiSamplesPage() {
  const [output, setOutput] = useState<string>("");

  async function callGetUsers() {
    setOutput("⏳ Calling Get Users...");
    try {
      const res = await fetch("/api/example", { method: "GET" });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setOutput("✅ Get Users complete — check /logs for full response.");
    } catch (err: any) {
      setOutput(`❌ Get Users failed: ${err.message}`);
    }
  }

  async function callPricingScenario() {
    setOutput("⏳ Calling Pricing Scenario...");
    try {
      const res = await fetch("/api/pricing-scenario", { method: "POST" });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setOutput("✅ Pricing Scenario complete — check /logs for full response.");
    } catch (err: any) {
      setOutput(`❌ Pricing Scenario failed: ${err.message}`);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--foreground)" }}
      >
        API Samples
      </h1>

      <p className="text-sm" style={{ color: "var(--muted)" }}>
        These sample calls execute real Polly API requests. Responses are logged
        securely on the <code>/logs</code> page.
      </p>

      <div className="flex gap-4">
        <button
          onClick={callGetUsers}
          className="px-4 py-2 rounded font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--button-text)",
          }}
        >
          Get Users
        </button>

        <button
          onClick={callPricingScenario}
          className="px-4 py-2 rounded font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--button-text)",
          }}
        >
          Pricing Scenario
        </button>
      </div>

      {/* Status Output */}
      {output && (
        <pre
          className="mt-4 p-4 rounded text-sm overflow-x-auto"
          style={{
            backgroundColor: "var(--panel)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
