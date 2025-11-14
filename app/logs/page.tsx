"use client";
import { useEffect, useState, useRef } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const [truncateEnabled, setTruncateEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  // -------------------------------
  // Load logs
  // -------------------------------
  const fetchServerLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Load initial data (logs + truncate flag)
  // -------------------------------
  useEffect(() => {
    // Prevent duplicate calls in React Strict Mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Fetch both in parallel
    Promise.all([
      fetchServerLogs(),
      fetch("/api/settings/truncate")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.enabled === "boolean") {
            setTruncateEnabled(data.enabled);
          }
        })
        .catch((err) => {
          console.error("Failed to load truncate setting", err);
        }),
    ]);
  }, []);

  // -------------------------------
  const handleClearLogs = async () => {
    try {
      await fetch("/api/logs", { method: "DELETE" });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 500) return "#ef4444";
    if (status >= 400) return "#f97316";
    if (status >= 300) return "#facc15";
    return "#10b981";
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "success") return log.status < 400;
    if (filter === "error") return log.status >= 400;
    return true;
  });

  const syntaxHighlight = (json: any) => {
    if (json === undefined || json === null) return "";
    let str: string;

    try {
      str = typeof json === "string" ? json : JSON.stringify(json, null, 2);
    } catch {
      str = String(json);
    }

    str = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return str.replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+(\.\d+)?\b)/g,
      (match) => {
        let color = "var(--foreground)";
        if (/^"/.test(match)) {
          color = /:$/.test(match)
            ? "var(--muted)"
            : "#3B82F6";
        } else if (/true|false/.test(match)) color = "#10b981";
        else if (/null/.test(match)) color = "#f59e0b";
        else color = "#f87171";

        return `<span style="color:${color}">${match}</span>`;
      }
    );
  };

  return (
    <div
      id="logsContainer"
      className="p-6 space-y-2 overflow-y-auto max-h-[80vh]"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            API Logs
          </h2>

          {/* FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm rounded border px-2 py-1"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>

          {/* TRUNCATE TOGGLE */}
          <button
            type="button"
            onClick={async () => {
              // Don't allow toggling until state is loaded
              if (truncateEnabled === null) {
                console.warn("[Truncate button] Clicked but state is null, ignoring");
                return;
              }
              
              // Handle null state properly - default to false if null
              const currentValue = truncateEnabled ?? false;
              const newValue = !currentValue;
              console.log(`[Truncate button] Toggling from ${currentValue} to ${newValue}`);
              setTruncateEnabled(newValue);

              await fetch("/api/settings/truncate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: newValue }),
              });
            }}
            disabled={truncateEnabled === null}
            className="text-sm px-3 py-1 rounded transition-colors"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent)";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--panel)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
          >
            {truncateEnabled ? "Truncate: ON" : "Truncate: OFF"}
          </button>

          {/* REFRESH */}
          <button
            onClick={fetchServerLogs}
            disabled={loading}
            className="text-sm px-3 py-1 rounded border transition-colors"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* CLEAR LOGS */}
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="text-sm px-3 py-1 rounded transition-colors"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            Clear Logs
          </button>
        )}
      </div>

      {filteredLogs.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No logs found.</p>
      )}

      {/* LOG LIST */}
      {filteredLogs.map((log) => (
        <div
          key={log.id}
          className="border rounded-md px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-[var(--panel)] shadow-sm"
          style={{
            borderColor: "var(--border)",
            backgroundColor:
              expanded === log.id ? "var(--panel)" : "transparent",
          }}
          onClick={() => setExpanded(expanded === log.id ? null : log.id)}
        >
          {/* SUMMARY */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 font-mono">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: getStatusColor(log.status),
                }}
              ></span>
              <span className="font-semibold" style={{ color: "var(--accent)" }}>
                [{log.method}]
              </span>
              <span>{log.endpoint}</span>
              <span
                style={{
                  color: log.status >= 400 ? "#f87171" : "var(--muted)",
                }}
              >
                {log.status}
              </span>
              · {log.duration} ms
            </div>
            <span
              className="text-xs"
              style={{
                color: "var(--muted)",
              }}
            >
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* EXPANDED DETAILS */}
          {expanded === log.id && (
            <div className="mt-3 text-xs space-y-3">
              <div>
                <div
                  className="font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Request
                </div>
                <pre
                  className="p-3 rounded-md overflow-x-auto"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.05)",
                    border: "1px solid var(--border)",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(log.request),
                  }}
                />
              </div>

              <div>
                <div
                  className="font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Response
                </div>
                <pre
                  className="p-3 rounded-md overflow-x-auto"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.05)",
                    border: "1px solid var(--border)",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(log.response),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
