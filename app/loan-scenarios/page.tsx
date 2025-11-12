"use client";
import { useState } from "react";

export default function LoanScenariosPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch() {
    // ✅ Immediate validation feedback
    if (!username.trim()) {
      setError("Please enter a Loan Officer username first.");
      return;
    }

    setError(null); // clear any prior error

    try {
      setLoading(true);
      console.log("🔹 Requesting portalLoginToken for:", username);

      const res = await fetch("/api/portal-authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) throw new Error(`Portal auth failed: ${res.status}`);

      const data = await res.json();
      console.log("✅ Portal token received:", data);
      setPortalToken(data.portalLoginToken);
    } catch (err: any) {
      console.error("❌ Portal token request failed:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const orgTicker =
    process.env.NEXT_PUBLIC_ORG_TICKER ||
    process.env.ORG_TICKER ||
    "RMS";

  const iframeUrl = portalToken
    ? `https://api.stage.polly.io/partner/api/v1/pe/portal/get_session/?portalLoginToken=${portalToken}&orgTicker=${orgTicker}`
    : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Loan Officer username"
          className="p-2 rounded border w-[250px]"
          style={{
            borderColor: error ? "red" : "var(--border)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          }}
        />
        <button
          onClick={handleLaunch}
          disabled={loading}
          className="px-4 py-2 rounded font-medium transition-colors duration-200"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--button-text)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "var(--accent)";
          }}
        >
          {loading ? "Loading..." : "Launch Pricer"}
        </button>
      </div>

      {/* ✅ Inline error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Embedded iFrame */}
      {iframeUrl && (
        <div className="mt-8">
          <iframe
            src={iframeUrl}
            title="Polly Pricer"
            className="w-full h-[800px] rounded border"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--panel)",
            }}
          />
        </div>
      )}
    </div>
  );
}
