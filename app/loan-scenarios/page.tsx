"use client";
import { useState } from "react";

export default function LoanScenariosPage() {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  async function handleContinue() {
    if (!username.trim()) return alert("Please enter a username");

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

      setShowModal(false);
      setPortalToken(data.portalLoginToken);
    } catch (err: any) {
      console.error("❌ Portal token request failed:", err);
      alert(`Error: ${err.message}`);
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
      {/* Launch Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 rounded font-medium transition-colors duration-200"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--button-text)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent)";
        }}
      >
        Launch Pricer
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div
            className="rounded-lg shadow-lg p-6 w-full max-w-md"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-xl font-semibold mb-4">
              Enter Loan Officer Username
            </h3>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rboesch"
              className="w-full p-2 rounded border mb-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded font-medium transition-colors duration-200"
                style={{
                  backgroundColor: "var(--border)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleContinue}
                className="px-4 py-2 rounded font-medium transition-colors duration-200"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--button-text)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent)";
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded iFrame */}
      {iframeUrl && (
       <div className="mt-8 -mx-6">
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
