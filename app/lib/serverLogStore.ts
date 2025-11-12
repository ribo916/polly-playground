// app/lib/serverLogStore.ts
export interface ServerLogEntry {
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
  
  let logs: ServerLogEntry[] = [];
  
  export function addServerLog(entry: Omit<ServerLogEntry, "id" | "timestamp">) {
    const newEntry: ServerLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newEntry); // newest first
  }
  
  export function getServerLogs() {
    return logs;
  }
  
  export function clearServerLogs() {
    logs = [];
  }
  