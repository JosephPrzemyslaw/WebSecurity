# Cookies

Sign-in app for cookie exercises. A successful login sets a `session` cookie and redirects to `/members`. Without it, `/members` redirects to `/login`.

- **Stack:** HTML/CSS/JS in the browser; Express + TypeScript on the server; in-memory SQLite from `server/sql/init.sql` (fresh on each `npm run dev`).
- **Port:** `3001`

## Prerequisites

Node.js 22+ and a browser.

## Layout

```text
Cookies/
  README.md
  assets/presentation/   # Keynote: samesite-compare (all), lax/none POST, lax-get/strict GET
  cross-site.html   # exercise 5 — open locally or on your own second origin
  server/
    src/index.ts
    src/session.ts
    pages/login.html, members.html
    public/…
```

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3001/login`**. Users: `ewa` / `ewa123`, `marc` / `marc123`. Login is `POST /login`; failures redirect to `/login?error=invalid`.

There is **no second server in this repo**. Exercise 5 uses `cross-site.html` from **another origin** that you provide (see exercise 5). Slides use `shop.lab` / `partner.lab` as generic labels.

Restarting the server clears in-memory sessions, purchases, and the database.

The members page loads `/chatbot.js`. The starter cookie has no `HttpOnly`, so the widget can print `session` from `document.cookie`. It uses `SameSite=None; Secure`.

## Exercises

**OWASP Top 10:2025 (official mapped CWE lists only):** **1** → [A04 Cryptographic Failures](https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/) (**CWE-330**, **CWE-340**). **2** → [A07 Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/) (**CWE-287**). **3–4** → [A02 Security Misconfiguration](https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/) (**CWE-1004**, **CWE-614**). **5** → [A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/) (**CWE-352**, **CWE-1275**). **CWE-565** (exercise 2) is a valid MITRE weakness but **not** on any Top 10:2025 category list — use it as extra detail, not as a Top 10 mapped CWE.

### 1. Predictable session token

**Vulnerability:** session identifier that is easy to guess or reuse (session hijacking without the password).

Sign in as `ewa` / `ewa123`. In DevTools, note the `session` cookie.

Open `server/src/session.ts` and read `createSessionID` (do not edit). The value is the login name (`ewa`). Anyone who knows it can set the same cookie and open `/members` without signing in.

Propose a safer value: not the login, hard to guess, unique per sign-in.

**OWASP Top 10:2025:** [A04 Cryptographic Failures](https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/) · **CWE-330** (Insufficiently Random Values) · **CWE-340** (Predictable session identifier). A07 *describes* strong session ids in “How to prevent” but does **not** list CWE-330.

### 2. Session cookie not checked against server store

**Vulnerability:** the app treats any `session=…` cookie as proof of login. It never checks that the server actually issued that session (e.g. after a successful login).

Restart the shop (`npm run dev`) so the in-memory session map is empty. **Do not sign in.**

In DevTools → Application → Cookies for `http://localhost:3001`, add `session` with value `not-in-database` (any string you like).

Open **`http://localhost:3001/members`**. With the starter code, the members page loads even though nobody logged in and that id was never stored server-side.

Open `server/src/session.ts` and find `currentSessionId`. Restore the check: uncomment `|| !session.has(sessionId)` so only ids created by `createSessionID` on login are accepted.

Repeat with a fresh cookie `not-in-database` — `/members` should redirect to `/login`. Sign in normally; `/members` should work again.

**Takeaway:** the cookie is sent by the browser; the server must look up the session id in its own store (database, cache, etc.), not trust the value alone.

**OWASP Top 10:2025:** [A07 Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/) · **CWE-287** (Improper Authentication). Related (not on Top 10 lists): **CWE-565** (reliance on cookie without validation).

### 3. Missing HttpOnly

**Vulnerability:** session cookie readable by any script on the page (often discussed together with XSS or a compromised third-party script).

Sign in as `ewa` and open the support chat. It prints `document.cookie`, including `session=ewa`.

In `server/src/index.ts`, add `HttpOnly` to `Set-Cookie`. Sign in again (old cookies may lack the flag until you get a new one).

The chat must no longer list `session`. Open `/members` — it should still work; the browser still sends the cookie to your server, only JavaScript cannot read it.

**Takeaway:** HttpOnly protects the cookie value from JS; it does not stop the browser from sending the cookie on requests to your app.

**OWASP Top 10:2025:** A02 Security Misconfiguration · **CWE-1004** (Sensitive Cookie Without `HttpOnly`)

### 4. Missing Secure

**Vulnerability:** without `Secure`, the session cookie can be sent on plain **HTTP** subrequests (e.g. mixed content: **HTTPS** page, **HTTP** image). The lab runs on **`http://localhost:3001`** — you will not see blocking here; explain the HTTPS case on slides (`shop.lab` + `http://…` cover).

Sign in as `ewa`. In DevTools, note **`Secure`** on `session` (`server/src/index.ts`). Optionally remove `Secure`, sign in again, then restore it before exercise 5.

**Takeaway:** `Secure` keeps the cookie off non-HTTPS requests in production.

**OWASP Top 10:2025:** A02 Security Misconfiguration · **CWE-614** (Sensitive Cookie Without `Secure` on HTTPS)

### 5. Permissive SameSite (cross-site cookie on POST)

**Vulnerability:** browser attaches the session cookie to a cross-site state-changing request (CSRF-style abuse of `/buy`).

Buy the book once from `/members` on **`http://localhost:3001`**. Keep `SameSite=None; Secure`.

**Partner page (instructor setup):** [`cross-site.html`](cross-site.html) is a **neutral-looking promo page** (no lab hints on the page). Serve it from a **different site** than the shop, e.g. `python3 -m http.server 8000` in `Cookies/` and open **`http://127.0.0.1:8000/cross-site.html`** (not `http://localhost:8000` — same host as the shop would be same-site for `SameSite`). Avoid `file://` for reliable cookie behavior.

Sign in on **`http://localhost:3001`**, then open the partner URL in another tab. The page looks like a club invitation; the button submits a `POST` to `http://localhost:3001/buy` (debrief with page source / Network). Check `/members` on the shop tab.

With `SameSite=None; Secure`, the session cookie should go with that cross-site `POST` and the book can be bought without using the shop UI.

Change the cookie to `SameSite=Lax`, sign in again on `localhost:3001`, and repeat from your cross-site page. The cross-site `POST` should not include the session; the purchase should not go through.

**Takeaway:** `Lax` blocks many cross-site `POST`s. `None` allows them—needed for some cross-site flows, dangerous for endpoints like `/buy` unless the application adds other defenses.

**Next module:** implement a **CSRF synchronizer token** in **[CSRF/](../CSRF/)** (port **3003**, exercise 1 continues this scenario).

**OWASP Top 10:2025:** **[A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)** · **CWE-352** (Cross-Site Request Forgery) · **CWE-1275** (Sensitive Cookie with Improper SameSite Attribute). The risky `Set-Cookie` flag is misconfiguration in plain language; OWASP’s Top 10 data maps CSRF and bad `SameSite` to **A01**, not A02.
