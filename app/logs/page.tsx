"use client";
import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const [loading, setLoading] = useState(false);

  const fetchServerLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch server logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerLogs();
  }, []);

  const handleClearLogs = async () => {
    try {
      await fetch("/api/logs", { method: "DELETE" });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear server logs:", err);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 500) return "#ef4444"; // red
    if (status >= 400) return "#f97316"; // orange
    if (status >= 300) return "#facc15"; // yellow
    return "#10b981"; // green
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
            ? "var(--muted)" // keys
            : "#3B82F6"; // strings
        } else if (/true|false/.test(match)) color = "#10b981";
        else if (/null/.test(match)) color = "#f59e0b";
        else color = "#f87171"; // numbers
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
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            API Logs
          </h2>

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

          {/* 🔄 Manual refresh button */}
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
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.backgroundColor = "var(--accent)";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--panel)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
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
            Clear Logs
          </button>
        )}
      </div>

      {filteredLogs.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          No {filter !== "all" ? filter : ""} logs found.
        </p>
      )}

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
          {/* summary line */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 font-mono">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: getStatusColor(log.status),
                  flexShrink: 0,
                }}
              ></span>
              <span className="font-semibold" style={{ color: "var(--accent)" }}>
                [{log.method}]
              </span>{" "}
              <span>{log.endpoint}</span>{" "}
              <span
                style={{
                  color: log.status >= 400 ? "#f87171" : "var(--muted)",
                }}
              >
                {log.status}
              </span>{" "}
              · {log.duration} ms
            </div>
            <span
              className="text-xs"
              style={{
                color: "var(--muted)",
                minWidth: "120px",
                textAlign: "right",
              }}
            >
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* expanded details */}
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
                  className="p-3 rounded-md overflow-x-auto shadow-sm"
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
                  className="p-3 rounded-md overflow-x-auto shadow-sm"
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
