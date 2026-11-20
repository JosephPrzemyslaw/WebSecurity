# Open redirect (chapter 7)

Member shop continuation from **[FileUpload](../FileUpload/)** (chapter 6, port **3005**). Same app on port **3006** with hardened avatar upload and a **return URL** after sign-in (`next`, CWE-601).

- **Port:** `3006`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123` (admin)
- **Stack:** Express + TypeScript, in-memory SQLite

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3006/login`**.

## Layout

```text
OpenRedirect/
  README.md
  server/
    pages/login.html
    src/redirect.ts          # USE_SAFE_REDIRECT, resolvePostLoginRedirect
    src/routes/auth.ts       # POST /login uses next
    src/session.ts           # unauthenticated → /login?next=…
    src/upload.ts            # upload flags ON (see File Upload lab)
```

| Request | Meaning |
|---------|---------|
| `GET /login?next=/account` | Login form; hidden `next` copied from query |
| `POST /login` | On success: `302` to `next` (or `/members`) |
| Protected routes without session | `302` → `/login?next=<path you wanted>` |

Flag **`USE_SAFE_REDIRECT`** in [`server/src/redirect.ts`](server/src/redirect.ts).

## Exercises

**CWE-601** · Avatar upload stays hardened from [FileUpload](../FileUpload/) — not exercised again here.

Keep **`USE_SAFE_REDIRECT = false`** for exercises **1–2**.

### 1. Server adds `next`

Sign out. Open **`http://localhost:3006/account`** (no session).

**Expected:** address becomes `/login?next=%2Faccount`. Sign in as `marc`. **Expected:** you land on **`/account`**, not `/members`.

### 2. Open redirect (phishing chain)

Open **`http://localhost:3006/login?next=https://example.com`**, sign in.

**Expected:** browser follows **`302`** to **example.com** — trusted shop host in the link, foreign host after login. Discuss phishing (no server RCE; the browser leaves your site).

Try **`next=//example.com`** as well while the flag is off.

#### Burp Suite

1. Proxy a normal sign-in, or send **`GET /login?next=/members`** to **Repeater**.
2. Change **`next`** to `https://example.com` (query on GET, or **`next`** field on **`POST /login`**).
3. For **`POST /login`**, send valid `login` / `password` with the poisoned **`next`**.
4. In the response, check **`302`** and **`Location:`** — **Follow redirection** to confirm the browser target.
5. Optional: filter Proxy history / site map for **3xx** after visiting protected pages.

This lab uses **server-side** `res.redirect()` (HTTP **Location**). It is not a **DOM-based** open redirect (`window.location` in JS). See [PortSwigger: open redirection](https://portswigger.net/support/using-burp-to-test-for-open-redirections).

**Further reading (not in this repo):** [OAuth token theft via open redirect](https://portswigger.net/web-security/oauth/lab-oauth-stealing-oauth-access-tokens-via-an-open-redirect).

### 3. Fix

In `server/src/redirect.ts`:

1. Comment out: `export const USE_SAFE_REDIRECT = false;`
2. Uncomment: `// export const USE_SAFE_REDIRECT = true;`
3. Restart `npm run dev`.

Repeat exercise **2** with `https://example.com` or `//example.com`. **Expected:** after login, redirect to **`/members`** only. Repeat exercise **1** — **`/account`** still works.

Defense: [OWASP — Unvalidated Redirects and Forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).

## Debrief

Open redirect is usually **low severity on the server**, but high **impact on users**: attackers abuse **your domain** in the link, victims authenticate, then **`Location`** sends them elsewhere. It is not file read (path traversal) or code on disk (file upload).

## Next steps

**Previous:** [FileUpload](../FileUpload/) — unrestricted upload (CWE-434).

**Next:** topics not in the repo yet (e.g. SSTI, SSRF) or reuse an existing chapter from the root [README](../README.md).