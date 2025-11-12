/**
 * Simple server-side log buffer shared across API routes.
 * Each call to addServerLog() pushes an entry into memory,
 * which the client LogContext pulls when rendering /logs.
 */

let serverLogs = [];

/** Push a new log entry */
export async function addServerLog(entry) {
  const logEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  serverLogs.push(logEntry);

  // Keep memory small — trim oldest after ~100 entries
  if (serverLogs.length > 100) {
    serverLogs = serverLogs.slice(-100);
  }
}

/** Return all logs (latest first) */
export async function getServerLogs() {
  return [...serverLogs].reverse();
}

/** Clear all logs */
export async function clearServerLogs() {
  serverLogs = [];
}
