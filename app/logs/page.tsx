"use client";
import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    const res = await fetch("/api/logs");
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }

  async function clearLogs() {
    await fetch("/api/logs", { method: "DELETE" });
    setLogs([]);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Server-Side API Logs</h2>
        <button
          onClick={clearLogs}
          className="px-3 py-1 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--button-text)",
          }}
        >
          Clear Logs
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading logs…</p>
      ) : logs.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No logs yet — make some API calls!</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded p-3"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--panel)",
              }}
            >
              {/* Header Row */}
              <div className="flex justify-between">
                <div>
                  <span
                    className="font-medium"
                    style={{ color: log.error ? "red" : "var(--accent)" }}
                  >
                    [{log.method}] {log.endpoint}
                  </span>
                  <span className="ml-2 text-sm" style={{ color: "var(--muted)" }}>
                    {log.status ?? "—"} · {log.duration ?? 0} ms
                  </span>
                </div>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Expanded Details */}
              <div className="mt-3 space-y-2 text-sm">
                {log.request && (
                  <details>
                    <summary className="cursor-pointer font-medium">Request</summary>
                    <pre className="mt-1 p-2 rounded bg-transparent border border-dashed"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      {JSON.stringify(log.request, null, 2)}
                    </pre>
                  </details>
                )}

                {log.response && (
                  <details>
                    <summary className="cursor-pointer font-medium">Response</summary>
                    <pre className="mt-1 p-2 rounded bg-transparent border border-dashed"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </details>
                )}

                {log.error && (
                  <p className="text-red-500">Error: {log.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
