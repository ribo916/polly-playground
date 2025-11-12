"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface LogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status?: number;
  duration?: number;
  request?: any;
  response?: any;
  error?: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  function addLog(entry: Omit<LogEntry, "id" | "timestamp">) {
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setLogs((prev) => [newEntry, ...prev]); // newest first
  }

  function clearLogs() {
    setLogs([]);
  }

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error("useLogs must be used within LogProvider");
  return ctx;
}
