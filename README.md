# Polly API Showcase

This project is a **Next.js-based showcase** designed to demonstrate real-world interactions with **Polly's API**. It provides a minimal but production-like structure for authenticating, calling Polly endpoints, and visualizing responses — while keeping credentials and tokens fully secure.

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

The app includes a few sample pages, such as:

* `/loan-scenarios` → Demonstrates launching Polly's embedded Pricer via portal token.
* `/api/example` → Calls Polly's `/api/v2/pe/users/` endpoint to show a basic API call.
* `/logs` → Displays real-time server logs of all outbound Polly API requests.

---

## 🧠 Architecture Overview

### 1. Server-Side Request Flow

All network calls to Polly are made **from the server**, never from the client. This ensures that sensitive credentials and API tokens remain protected.

The flow typically looks like:

```
Client → /api/example → /api/auth → Polly API (auth/token)
                             ↳ Polly API (data endpoint)
```

Only the **actual Polly API calls** are logged and shown in `/logs`.

### 2. `logFetch.ts`

A lightweight wrapper around `fetch()` that:

* Measures duration, status, and errors for each call.
* Redacts sensitive credentials and headers before logging.
* Only logs **external Polly API calls** (not internal `/api/...` routes).

```ts
const shouldLog = url.includes("pollyex.com") || url.includes("api.stage.polly.io");
```

Redaction automatically removes tokens, passwords, and secrets from both request bodies and headers.

### 3. `serverLogStore.ts`

In-memory storage for all log entries:

```ts
addServerLog({ endpoint, method, status, duration, request, response, error });
```

* Keeps logs only during runtime (not persisted).
* Trims old entries after 100 items.

### 4. `/api/logs`

A Next.js **Route Handler** that:

* Returns all logs via `GET`.
* Clears logs via `DELETE`.

### 5. `/logs` UI

A client page that renders the current logs in a readable format with syntax highlighting.

* Only server-side logs are now shown.
* Expanding a log entry reveals sanitized request/response payloads.

---

## 🧩 Known Edge Cases

* **Chained internal requests**: If a route like `/api/example` calls another internal route (`/api/auth`), only the final outbound requests to Polly are logged. This avoids noise in the `/logs` page.
* **URLSearchParams bodies**: Automatically converted to objects before logging.
* **Token or password exposure**: Automatically redacted in both headers and bodies.

---

## ⚠️ Refactoring Notes

This setup intentionally avoids using a database or file persistence. However, if you later:

* Add caching or server restarts, logs will reset.
* Add concurrent API calls, consider thread-safe logging (e.g. with Redis).
* Expand to other APIs (non-Polly), update the `shouldLog` logic.

When debugging or adding new features, focus on **`logFetch`** — that’s the central hook for all outbound tracking and where most bugs will surface.

---

## 🧭 Project Intent

This isn’t meant to be a full product — it’s a **demo harness** for Polly’s APIs. Each route (e.g., `/api/portal-authentication`, `/api/auth`, `/api/example`) should correspond to a real-world Polly workflow and demonstrate what data Polly returns, not how this app functions internally.

---

## ✅ Summary

| Component           | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `logFetch.ts`       | Handles outbound Polly API calls and redacted logging |
| `serverLogStore.ts` | Keeps in-memory log list for current runtime          |
| `/api/logs`         | Returns or clears logs                                |
| `/logs`             | Displays all logged Polly calls                       |

---

**Recommended next step:** integrate additional Polly endpoints into `logFetch()` and the UI to build out a richer demo catalog for pricing, locking, and product workflows.
