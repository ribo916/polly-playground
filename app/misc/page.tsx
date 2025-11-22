"use client";
import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

export default function ApiSamplesPage() {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  async function callGetUsers() {
    setLoading("users");
    setOutput("⏳ Calling Get Users...");
    try {
      const res = await fetch("/api/example", { method: "GET" });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setOutput("✅ Get Users complete — check /logs for full response.");
    } catch (err: any) {
      setOutput(`❌ Get Users failed: ${err.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function callPricingScenario() {
    setLoading("pricing");
    setOutput("⏳ Calling Pricing Scenario...");
    try {
      const res = await fetch("/api/pricing-scenario", { method: "POST" });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setOutput("✅ Pricing Scenario complete — check /logs for full response.");
    } catch (err: any) {
      setOutput(`❌ Pricing Scenario failed: ${err.message}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--foreground)" }}
        >
          API Samples
        </h1>
        <p 
          className="text-sm"
          style={{ color: "var(--muted)" }}
        >
          Execute sample Polly API requests. Responses are logged securely on the{" "}
          <a 
            href="/logs" 
            className="font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            /logs
          </a>{" "}
          page.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={callGetUsers}
          disabled={loading !== null}
          className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          style={{
            background: loading === "users" 
              ? "var(--muted-bg)" 
              : "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
            color: "var(--button-text)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {loading === "users" ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Play size={18} />
              Get Users
            </>
          )}
        </button>

        <button
          onClick={callPricingScenario}
          disabled={loading !== null}
          className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          style={{
            background: loading === "pricing" 
              ? "var(--muted-bg)" 
              : "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
            color: "var(--button-text)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {loading === "pricing" ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Play size={18} />
              Pricing Scenario
            </>
          )}
        </button>
      </div>

      {/* Status Output */}
      {output && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--panel-elevated)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow)",
          }}
        >
          <pre
            className="text-sm whitespace-pre-wrap"
            style={{ color: "var(--foreground)" }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
