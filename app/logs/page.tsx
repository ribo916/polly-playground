"use client";
import { useEffect, useState, useRef } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const [truncateEnabled, setTruncateEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

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

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    Promise.all([
      fetchServerLogs(),
      fetch("/api/settings/truncate")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.enabled === "boolean") {
            setTruncateEnabled(data.enabled);
          }
        })
        .catch((err) => console.error("Failed truncate load:", err)),
    ]);
  }, []);

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
      className="p-8 space-y-4 overflow-y-auto scroll-mt-24"
      style={{ backgroundColor: "var(--background)", height: "100%" }}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            API Logs
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Monitor all API requests and responses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>

          {/* Truncate toggle */}
          <button
            type="button"
            disabled={truncateEnabled === null}
            onClick={async () => {
              if (truncateEnabled === null) return;
              const newValue = !truncateEnabled;
              setTruncateEnabled(newValue);

              await fetch("/api/settings/truncate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: newValue }),
              });
            }}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: truncateEnabled ? "var(--accent-bg)" : "var(--panel)",
              color: truncateEnabled ? "var(--accent)" : "var(--foreground)",
              border: "1.5px solid",
              borderColor: truncateEnabled ? "var(--accent)" : "var(--border)",
            }}
          >
            {truncateEnabled ? "Truncate: ON" : "Truncate: OFF"}
          </button>

          <button
            onClick={fetchServerLogs}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: "var(--panel)",
              color: "var(--foreground)",
              border: "1.5px solid var(--border)",
            }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--error)",
                color: "white",
                border: "1.5px solid var(--error)",
              }}
            >
              Clear Logs
            </button>
          )}
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div
          className="p-8 rounded-xl border text-center"
          style={{
            backgroundColor: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          <p style={{ color: "var(--muted)" }}>No logs found.</p>
        </div>
      )}

      {/* LOG LIST */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const responseBody =
            log.response ??
            log.data ??
            log.body ??
            log.payload ??
            log.res ??
            null;

          return (
            <div
              key={log.id}
              className="border rounded-xl px-5 py-4 cursor-pointer transition-all hover:scale-[1.01] scroll-mt-24"
              style={{
                borderColor: expanded === log.id ? "var(--accent)" : "var(--border)",
                backgroundColor:
                  expanded === log.id ? "var(--panel-elevated)" : "var(--panel)",
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
                  />
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

                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* EXPANDED */}
              {expanded === log.id && (
                <div
                  className="mt-4 pt-4 border-t space-y-4 scroll-mt-24"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* REQUEST */}
                  <div>
                    <div
                      className="text-xs font-semibold mb-2 uppercase tracking-wide"
                      style={{ color: "var(--muted)" }}
                    >
                      Request
                    </div>
                    <pre
                      className="p-4 rounded-lg overflow-x-auto overflow-y-auto text-xs scroll-mt-24"
                      style={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        maxHeight: "400px",
                        paddingTop: "20px",
                        scrollMarginTop: "80px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: syntaxHighlight(log.request),
                      }}
                    />
                  </div>

                  {/* RESPONSE */}
                  <div>
                    <div
                      className="text-xs font-semibold mb-2 uppercase tracking-wide"
                      style={{ color: "var(--muted)" }}
                    >
                      Response
                    </div>
                    <pre
                      className="p-4 rounded-lg overflow-x-auto overflow-y-auto text-xs scroll-mt-24"
                      style={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        maxHeight: "400px",
                        paddingTop: "20px",
                        scrollMarginTop: "80px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: syntaxHighlight(log.response),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
