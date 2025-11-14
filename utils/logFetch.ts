import { addServerLog, getTruncateFlag } from "../app/lib/serverLogStore";
import { truncateResponse } from "./truncateResponse";

/**
 * Wrapper around fetch() that logs only external Polly API calls,
 * automatically redacts sensitive credentials, and optionally truncates large JSON.
 */
export async function logFetch(
  url: string,
  options: RequestInit = {},
  endpoint = ""
) {
  const start = Date.now();
  let data: any = null;
  let status = 0;
  let error: string | undefined;

  try {
    if (!url || typeof url !== "string") {
      throw new Error(`Invalid URL passed to logFetch: ${url}`);
    }

    const res = await fetch(url, options);
    status = res.status;

    try {
      // Try JSON, fall back to text
      data = await res.clone().json();
    } catch {
      data = await res.text();
    }

    return { data, status };
  } catch (err: any) {
    error = err?.message || "Unknown fetch error";
    return { data: null, status: 0, error };
  } finally {
    const duration = Date.now() - start;

    // Only log external Polly API calls
    const shouldLog =
      typeof url === "string" &&
      (url.includes("pollyex.com") ||
        url.includes("api.stage.polly.io"));

    if (shouldLog) {
      try {
        // 🔥 CRITICAL FIX — read truncate flag from Redis
        const truncateEnabled = await getTruncateFlag();

        // ---------- REQUEST ----------
        const parsedRequest = safeParse(options.body);
        const redactedRequest = redactSensitiveData(parsedRequest);
        const cleanHeaders = redactHeaders(options.headers);

        const finalRequest = truncateEnabled
          ? truncateResponse(redactedRequest)
          : redactedRequest;

        // ---------- RESPONSE ----------
        const cleanedResponse = redactSensitiveData(data);

        const finalResponse = truncateEnabled
          ? truncateResponse(cleanedResponse)
          : cleanedResponse;

        // ---------- WRITE LOG ----------
        await addServerLog({
          endpoint: endpoint || url,
          method: options.method || "GET",
          status,
          duration,
          request: { ...finalRequest, headers: cleanHeaders },
          response: finalResponse,
          error,
        });
      } catch (logErr) {
        console.error("⚠️ logFetch -> addServerLog failed:", logErr);
      }
    }
  }
}

/** Redact any sensitive keys or tokens */
function redactSensitiveData(obj: any) {
  if (!obj || typeof obj !== "object") return obj;

  const clone: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (/(password|token|secret|authorization|client_id|client_secret)/i.test(key)) {
      clone[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      clone[key] = redactSensitiveData(value);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}

/** Safely handle headers and redact Authorization */
function redactHeaders(headers: any) {
  if (!headers) return undefined;

  const clean: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((v, k) => {
      clean[k] = /authorization|token/i.test(k) ? "[REDACTED]" : v;
    });
  } else if (typeof headers === "object") {
    for (const [k, v] of Object.entries(headers)) {
      clean[k] = /authorization|token/i.test(k) ? "[REDACTED]" : String(v);
    }
  }

  return clean;
}

/** Safely parse JSON or URLSearchParams */
function safeParse(input?: string | any) {
  if (!input) return undefined;

  if (input instanceof URLSearchParams) {
    return Object.fromEntries(input.entries());
  }

  if (typeof input === "object") return input;

  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}
