import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const LOG_KEY = "server_logs";

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

/** ALWAYS stringify on write */
export async function addServerLog(entry: Omit<ServerLogEntry, "id" | "timestamp">) {
  const log: ServerLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  await redis.lpush(LOG_KEY, JSON.stringify(log));
  await redis.ltrim(LOG_KEY, 0, 99);
  //await redis.expire(LOG_KEY, 86400); // expire the log list after 24 hours
  // Set or refresh TTL to 7 days (604,800 seconds)
  await redis.expire(LOG_KEY, 604800);
}

/** Be tolerant on read: handle strings OR objects */
export async function getServerLogs(): Promise<ServerLogEntry[]> {
  const raw = await redis.lrange(LOG_KEY, 0, 99);
  const parsed = raw
    .map((r: unknown) => {
      try {
        if (typeof r === "string") return JSON.parse(r);
        if (r && typeof r === "object") return r as ServerLogEntry;
        return null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ServerLogEntry[];

  // optional: de-dupe by id in case of legacy dupes
  const seen = new Set<string>();
  return parsed.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}

/** Clear all logs */
export async function clearServerLogs() {
  await redis.del(LOG_KEY);
}
