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

**OWASP Top 10:2025 framing:** exercises **3–4** match **[A02 Security Misconfiguration](https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/)** mapped CWEs (**CWE-1004**, **CWE-614**). **Exercise 2** is **[A07 Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/)** (**CWE-287** / **CWE-565**). **Exercise 5** is **[A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)** — OWASP lists **CWE-352** (CSRF) and **CWE-1275** (improper `SameSite`) under A01, not A02. **Exercise 1** (predictable id) is grouped with misconfiguration in the workshop; OWASP A02’s official CWE list does not include **CWE-330** (see A07 / session hardening in ASVS).

### 1. Predictable session token

**Vulnerability:** session identifier that is easy to guess or reuse (session hijacking without the password).

Sign in as `ewa` / `ewa123`. In DevTools, note the `session` cookie.

Open `server/src/session.ts` and read `createSessionID` (do not edit). The value is the login name (`ewa`). Anyone who knows it can set the same cookie and open `/members` without signing in.

Propose a safer value: not the login, hard to guess, unique per sign-in.

**OWASP Top 10:2025:** A02 Security Misconfiguration (insecure session id) · **CWE-330** (Insufficiently Random Values) · **CWE-287** (Improper Authentication)

### 2. Session cookie not checked against server store

**Vulnerability:** the app treats any `session=…` cookie as proof of login. It never checks that the server actually issued that session (e.g. after a successful login).

Restart the shop (`npm run dev`) so the in-memory session map is empty. **Do not sign in.**

In DevTools → Application → Cookies for `http://localhost:3001`, add `session` with value `not-in-database` (any string you like).

Open **`http://localhost:3001/members`**. With the starter code, the members page loads even though nobody logged in and that id was never stored server-side.

Open `server/src/session.ts` and find `currentSessionId`. Restore the check: uncomment `|| !session.has(sessionId)` so only ids created by `createSessionID` on login are accepted.

Repeat with a fresh cookie `not-in-database` — `/members` should redirect to `/login`. Sign in normally; `/members` should work again.

**Takeaway:** the cookie is sent by the browser; the server must look up the session id in its own store (database, cache, etc.), not trust the value alone.

**OWASP Top 10:2025:** A07 Authentication Failures · **CWE-287** (Improper Authentication) · **CWE-565** (cookie not validated against server state)

### 3. Missing HttpOnly

**Vulnerability:** session cookie readable by any script on the page (often discussed together with XSS or a compromised third-party script).

Sign in as `ewa` and open the support chat. It prints `document.cookie`, including `session=ewa`.

In `server/src/index.ts`, add `HttpOnly` to `Set-Cookie`. Sign in again (old cookies may lack the flag until you get a new one).

The chat must no longer list `session`. Open `/members` — it should still work; the browser still sends the cookie to your server, only JavaScript cannot read it.

**Takeaway:** HttpOnly protects the cookie value from JS; it does not stop the browser from sending the cookie on requests to your app.

**OWASP Top 10:2025:** A02 Security Misconfiguration · **CWE-1004** (Sensitive Cookie Without `HttpOnly`)

### 4. Missing Secure (mixed content)

**Vulnerability:** session cookie sent with non-HTTPS requests to the same host (e.g. passive mixed content).

Assume the shop runs over HTTPS on `shop.lab`. For the mixed-content demo, change the cover on `/members` from `/gone-with-the-wind.svg` to an absolute `http://shop.lab:3001/gone-with-the-wind.svg` URL.

The starter cookie includes `Secure`, so the browser should not send it with that HTTP image request. If you removed `Secure`, the same cookie could leak on that subresource request.

**Takeaway:** `Secure` limits the cookie to HTTPS URLs on this host.

**OWASP Top 10:2025:** A02 Security Misconfiguration · **CWE-614** (Sensitive Cookie Without `Secure` on HTTPS)

### 5. Permissive SameSite (cross-site cookie on POST)

**Vulnerability:** browser attaches the session cookie to a cross-site state-changing request (CSRF-style abuse of `/buy`).

Buy the book once from `/members` on **`http://localhost:3001`**. Keep `SameSite=None; Secure` (on plain HTTP some browsers refuse `Secure` cookies—adjust flags for your setup if login does not stick).

**Cross-site page (you host it):** use [`cross-site.html`](cross-site.html). It is not part of the shop app. Open it from an origin **other than** `http://localhost:3001`, for example:

- Open the file in the browser (`file:///…/cross-site.html`), **or**
- Serve the `Cookies/` folder yourself, e.g. `python3 -m http.server 8080` in that directory and open `http://127.0.0.1:8080/cross-site.html` (different site from `localhost:3001`).

Sign in on **`http://localhost:3001`** (same host as the form’s `action`). Click **Buy the book for me** on your cross-site page — `POST` to **`http://localhost:3001/buy`** (hidden iframe; check `/members` on the shop tab).

With `SameSite=None; Secure`, the session cookie should go with that cross-site `POST` and the book can be bought without using the shop UI.

Change the cookie to `SameSite=Lax`, sign in again on `localhost:3001`, and repeat from your cross-site page. The cross-site `POST` should not include the session; the purchase should not go through.

**Takeaway:** `Lax` blocks many cross-site `POST`s. `None` allows them—needed for some cross-site flows, dangerous for endpoints like `/buy` unless you add other defenses (CSRF tokens, later).

**OWASP Top 10:2025:** **[A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)** · **CWE-352** (Cross-Site Request Forgery) · **CWE-1275** (Sensitive Cookie with Improper SameSite Attribute). The risky `Set-Cookie` flag is misconfiguration in plain language; OWASP’s Top 10 data maps CSRF and bad `SameSite` to **A01**, not A02.
