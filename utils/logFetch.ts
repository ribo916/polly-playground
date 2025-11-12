import { addServerLog } from "../app/lib/serverLogStore";

/**
 * Wrapper around fetch() that logs only external Polly API calls,
 * asynchronously (fire-and-forget) and redacts sensitive credentials.
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

    // Safely attempt JSON parse, fallback to text
    try {
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

    // ✅ Only log *external Polly* calls
    const shouldLog =
      typeof url === "string" &&
      (url.includes("pollyex.com") || url.includes("api.stage.polly.io"));

    if (shouldLog) {
      // 🧠 Fire-and-forget to avoid blocking API responses
      (async () => {
        try {
          const cleanRequest = redactSensitiveData(safeParse(options.body));
          const cleanHeaders = redactHeaders(options.headers);

          await addServerLog({
            endpoint: endpoint || url,
            method: options.method || "GET",
            status,
            duration,
            request: { ...cleanRequest, headers: cleanHeaders },
            response: redactSensitiveData(data),
            error,
          });
        } catch (logErr) {
          console.error("⚠️ logFetch -> addServerLog failed:", logErr);
        }
      })();
    }
  }
}

/** Redact any sensitive keys or tokens */
function redactSensitiveData(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const clone: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      /(password|token|secret|authorization|client_id|client_secret)/i.test(key)
    ) {
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
      clean[k] =
        /authorization/i.test(k) || /token/i.test(k) ? "[REDACTED]" : v;
    });
  } else if (typeof headers === "object") {
    for (const [k, v] of Object.entries(headers)) {
      clean[k] =
        /authorization/i.test(k) || /token/i.test(k) ? "[REDACTED]" : String(v);
    }
  }
  return clean;
}

/** Safely parse JSON or URLSearchParams */
function safeParse(input?: string | any) {
  if (!input) return undefined;
  if (input instanceof URLSearchParams) return Object.fromEntries(input.entries());
  if (typeof input === "object") return input;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}
