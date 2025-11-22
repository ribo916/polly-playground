import { addServerLog } from "@/app/lib/serverLogStore";

function safeClone(value: any) {
  // If value is a JSON string → parse it
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      // Not JSON, return raw string
      return value;
    }
  }

  // If value is a FormData or URLSearchParams, convert to object
  if (value instanceof URLSearchParams) {
    return Object.fromEntries(value.entries());
  }

  if (value instanceof FormData) {
    return Object.fromEntries(value.entries());
  }

  return value; // primitives / objects are fine
}

export async function logFetch(
  url: string,
  options: RequestInit = {},
  label: string = "fetch"
) {
  const start = Date.now();

  console.log(`🔵 [${label}] FETCH →`, url);

  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };

  // Clone body safely for logging
  const loggedRequest = {
    ...finalOptions,
    body: safeClone(finalOptions.body),
  };

  let res: Response;
  let error: any = null;

  try {
    res = await fetch(url, finalOptions);
  } catch (err) {
    error = err;

    console.error(`❌ [${label}] NETWORK ERROR:`, err);

    // Log network failure to Redis
    await addServerLog({
      endpoint: url,
      method: finalOptions.method || "GET",
      status: 0,
      duration: Date.now() - start,
      request: loggedRequest,
      error: String(err),
    });

    throw err;
  }

  // Try to JSON-parse the body for clean pretty logs
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON is fine → logged as raw
  }

  console.log(`🟣 [${label}] STATUS ← ${res.status}`);

  // Pretty response clone
  const loggedResponse = safeClone(data);

  // Store structured, pretty JSON in Redis
  await addServerLog({
    endpoint: url,
    method: finalOptions.method || "GET",
    status: res.status,
    duration: Date.now() - start,
    request: loggedRequest,
    response: loggedResponse,
  });

  return { status: res.status, data };
}
