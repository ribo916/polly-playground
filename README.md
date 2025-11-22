# Polly Playground

This project is a **Next.js-based showcase** demonstrating real-world interactions with **Polly’s API**, including authentication, pricing workflows, portal logins, secure environment overrides, and structured server-side logging. All sensitive credentials remain server-side and are never exposed to the browser.

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open: **[http://localhost:3000](http://localhost:3000)**

Featured pages:

* `/loan-scenarios` → Launch Polly Portal iFrame via portal token
* `/api/example` → Example API call to `/api/v2/pe/users/`
* `/logs` → Real-time server logs for outbound Polly API requests

---

## 🧠 Architecture Overview

### 1. Server-Only API Calls

All Polly interactions are performed **on the server**, not the client. Credentials, client secrets, and access tokens are never available to browser JavaScript.

```
Client → /api/route → Server → Polly API → Server → Client
```

This keeps the surface area secure and avoids exposing API tokens to front-end code.

---

## 🔐 Secure Session Overrides

The application supports temporary, secure **session-based environment overrides**. These let you switch:

* Polly Base URL
* Org ticker
* Username/password
* Client ID/secret

…without storing anything in the browser.

### How it works

* The browser stores a **secure, HTTP-only session ID cookie**.
* The actual override values are stored **only in server memory** (`OverrideStore`).
* No environment values ever appear in localStorage or client JS.
* Overrides last until the browser closes or you press **Reset**.

This lets you test different orgs/customers quickly and safely.

---

## 📡 Logging System

### `logFetch.ts`

All outbound calls to Polly pass through `logFetch`, which:

* Captures status, duration, and endpoint
* Safely parses JSON and URLSearchParams
* Redacts passwords, tokens, secrets
* Sends logs to the centralized server log store

### `serverLogStore.ts`

A server-side in-memory (or Redis-backed) store that holds the most recent ~100 log entries.

```ts
addServerLog({ endpoint, method, status, duration, request, response, error });
```

### `/logs` Viewer

The `/logs` page displays:

* Endpoint
* Duration
* Request + Response bodies (pretty-printed)
* Error details (if any)

### Logging Notes

* Only **external Polly API calls** are logged to avoid noise.
* Sensitive values are automatically sanitized.
* Logs reset when the server restarts unless Redis persistence is enabled.

---

## 🧩 Known Edge Cases

* Invalid override URLs will cause fetch errors (logged properly).
* Non-JSON responses are still logged cleanly.
* URLSearchParams bodies are auto-converted to objects.
* Logs show real requests only; internal `/api/...` hops are intentionally not logged.

---

## 🧭 Project Intent

This project is a **demo harness** for exploring Polly API workflows end-to-end. Each API route (pricing scenario, auth, portal login, create-loan, etc.) demonstrates realistic interaction patterns while keeping credentials secure and providing transparent logging.

---

## ✅ Summary

| Component           | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `logFetch.ts`       | Centralized Polly API logging + safe redaction |
| `serverLogStore.ts` | In-memory/Redis storage for log entries        |
| `getEnvValue.ts`    | Secure lookup for per-session overrides        |
| Env Override Modal  | Temporary org/environment switching            |
| `/api/*` routes     | Server-only Polly API integrations             |
| `/logs`             | Real-time, structured request inspector        |

---
