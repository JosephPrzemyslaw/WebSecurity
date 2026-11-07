# CSRF

Member shop lab for cross-site request forgery defenses. Complete **[Cookies](../Cookies/) exercise 5** first (SameSite and the partner `POST /buy` demo on port **3001**).

This app reuses the same story on port **3003** with a hardened session cookie (`HttpOnly`, `Secure`, `SameSite=None` for partner demos). Fixes use a **synchronizer token** — not cookie flag changes.

- **Stack:** Express + TypeScript, in-memory SQLite (`server/sql/init.sql`).
- **Port:** `3003`
- **Accounts:** `ewa` / `ewa123` (admin), `marc` / `marc123`

## Partner pages

Serve files from this folder on a **different site** than the shop:

```bash
cd CSRF
python3 -m http.server 8000
```

Open partner URLs at **`http://127.0.0.1:8000/…`** (not `http://localhost:8000` — that is same-site with `http://localhost:3003` for `SameSite`).

| File | Used in |
|------|---------|
| [`cross-site-buy.html`](cross-site-buy.html) | Exercise 1 |
| [`cross-site-delete-account.html`](cross-site-delete-account.html) | Exercise 2 |
| [`fake-inbox.html`](fake-inbox.html) | Exercise 3 |

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3003/login`**.

After sign-in, use the shop nav: **`/members`** (library), **`/account`** (profile and delete), **`/team`** (create users — **ewa** only), **Sign out** (`POST /logout`).

## Layout

Lab logic is split across several files (exercises are **not** all in `index.ts`).

```text
CSRF/
  README.md
  cross-site-buy.html
  cross-site-delete-account.html
  fake-inbox.html
  server/
    src/
      index.ts           # bootstrap only
      session.ts         # Exercise 1–3: CSRF token block (commented)
      appDeps.ts
      cookies.ts
      users.ts
      forms.ts           # HTML snippets + Exercise 1–3 hidden-field comments
      shopPages.ts       # nav + page rendering
      routes/
        auth.ts          # login, logout; Exercise 1 issueCsrfToken
        members.ts       # /members, POST /buy; Exercise 1 guard
        account.ts       # /account, POST /deleteAccount; Exercise 2 guard
        team.ts          # /team, GET /addUsers (bad API); Exercise 3 guard
    pages/
    public/
    sql/
```

| Exercise | Main files |
|----------|----------------|
| **1** | `session.ts`, `routes/auth.ts`, `forms.ts`, `routes/members.ts` |
| **2** | `forms.ts`, `routes/account.ts` |
| **3** | `routes/team.ts`, `forms.ts` |

## Exercises

**OWASP Top 10:2025:** [A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/) · **CWE-352** (Cross-Site Request Forgery)

Fixes are already in the repo inside **comments**. Uncomment step by step and sign in again when a step issues a new session or token.

### 1. Synchronizer token on `POST /buy`

**Vulnerability:** cross-site form can buy the book with the victim’s session (same idea as Cookies §5).

Sign in as `marc`. Buy once from `/members` if you need a baseline. Open [`cross-site-buy.html`](cross-site-buy.html) from `127.0.0.1:8000` while signed in — the book is purchased without using the shop button.

**Uncomment in this order:**

1. CSRF block in [`server/src/session.ts`](server/src/session.ts) (`issueCsrfToken`, `csrfTokenFor`, `csrfTokenValid`, …).
2. Import those symbols in the route files that need them (`routes/auth.ts`, `routes/members.ts`, …).
3. `issueCsrfToken(sessionId)` in [`routes/auth.ts`](server/src/routes/auth.ts) after login.
4. In [`forms.ts`](server/src/forms.ts) `buildBuyForm`, uncomment the `csrfHidden` block; in [`routes/members.ts`](server/src/routes/members.ts) uncomment `buildBuyForm(deps.bookId, csrfTokenFor(sessionId))`.
5. Guard at the start of `POST /buy` in [`routes/members.ts`](server/src/routes/members.ts).

Sign in again, repeat the partner page — purchase should **not** go through. `SameSite=None` can still send the cookie; the missing **secret token** blocks the action.

### 2. `POST /deleteAccount`

**Vulnerability:** a partner page can auto-submit a form and delete the signed-in account.

Sign in as `marc`. The legitimate form lives on **`/account`** (section “Close your account”; the shop UI opens a confirmation dialog — that step is **not** shown on cross-site attacks). Open [`cross-site-delete-account.html`](cross-site-delete-account.html) from the partner origin — you are logged out and `marc` is removed from the database (restart `npm run dev` to reset in-memory data).

Uncomment the `csrfHidden` block in [`forms.ts`](server/src/forms.ts) `buildDeleteAccountForm` and the `csrfTokenFor` call in [`routes/account.ts`](server/src/routes/account.ts); uncomment the guard on `POST /deleteAccount`.

Repeat the partner page — account should **not** be deleted.

### 3. `GET /addUsers` and `<img>`

**Vulnerability:** this lab’s “admin API” is **deliberately badly written** — **`GET /addUsers`** creates users (query parameters). Real APIs should use **POST** (or similar) for mutations; here we keep GET so the mistake is obvious.

**`/team`** submits the same **`GET /addUsers`** endpoint (no CSRF token yet). Creating users from the form works when signed in as **`ewa`**.

Sign in as **`ewa`**, open [`fake-inbox.html`](fake-inbox.html) from `127.0.0.1:8000` — the banner `<img>` loads `GET /addUsers?…` with your session cookie and creates **`tom`** / `tom123` without you clicking **Create user**.

**Fix (lab):**

1. Uncomment the `csrfHidden` block in [`forms.ts`](server/src/forms.ts) `buildAddUserForm` and the `csrfTokenFor` call in [`routes/team.ts`](server/src/routes/team.ts).
2. Uncomment the guard on **`GET /addUsers`** in [`routes/team.ts`](server/src/routes/team.ts) (`req.query.csrfToken`).

Open `fake-inbox.html` again — `tom` should **not** be created via `<img>` (attack URL has no token). **Create user** on **`/team`** should still work with the hidden field.

**Debrief:** `<img>` only performs GET, so mutating GET is especially dangerous. A synchronizer token in the query string blocks naive `<img>` CSRF but is **not** a substitute for a well-designed API (POST + token in body, no secrets in URLs). Stored HTML with the same URL is an **XSS/injection** topic, not cross-site POST CSRF.

**Note:** Origin / Referer checks, login CSRF, and JSON `fetch` CSRF are out of scope for this lab; a CSRF token on mutating POSTs is the primary defense taught here.
