# Stored XSS

Member shop copied from **[Path Traversal](../PathTraversal/)** (port **3004**). On port **3002** the vulnerable feature is an opinion under *Gone with the Wind* on `/members`. The note is saved and written into the page for the next signed-in reader (CWE-79).

Chapter download uses the Path Traversal fix already turned on: the path is resolved and rejected unless it stays under that book's `chapters/` directory. `../` returns **403 Not allowed**. That route is not an exercise here. Buy is shop continuity only.

- **Port:** `3002`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123` (admin)
- **Stack:** Express + TypeScript, in-memory SQLite (`server/sql/init.sql`). Restarting `npm run dev` clears sessions, purchases, and opinions.

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3002/login`**.

## Layout

```text
XSS/
  README.md
  server/
    src/comments.ts           # USE_SAFE_HTML; stored opinions inserted into the page
    src/routes/library.ts     # chapter download, path jail already on
    src/routes/members.ts     # GET /members, POST /comments, POST /buy
    pages/members.html        # opinion form, <!-- COMMENTS -->
    content/library/books/gone-with-the-wind/chapters/chapter-01.txt
```

| Request | Meaning |
|---------|---------|
| `POST /comments` | Save the signed-in login and `body`, then redirect to `/members` |
| `GET /members` | Library page; opinions are inserted into the HTML |
| `GET /library/books/gone-with-the-wind/chapters/chapter-01.txt` | Legal chapter (path jail from Path Traversal, already on) |

`USE_SAFE_HTML` in [`server/src/comments.ts`](server/src/comments.ts) controls whether that text is escaped.

## Exercises

**CWE-79** (Improper Neutralization of Input During Web Page Generation).

The session cookie is `HttpOnly`, same as the shop. One browser holds one session, so the other account is a sign-out, not a second tab.

### 1. A normal opinion

Sign in as `marc` / `marc123`. On `/members`, post `świetna książka`.

Sign out. Sign in as `ewa` / `ewa123`. The same sentence is on `/members`, under **marc**. It was stored, not carried only in the URL.

### 2. HTML

Sign in as `marc`. In **Opinion**, submit:

```html
<b>tu jest HTML</b>
```

Sign in as `ewa`. The words are bold. The server pasted `body` into the HTML instead of showing the angle brackets.

### 3. A script for the next reader

Sign in as `marc`. In **Opinion**, submit:

```html
<img src=x onerror=alert(document.domain)>
```

Sign in as `ewa`. The alert runs when `/members` loads. The script runs as this origin (`localhost:3002`).

**Debrief:** `alert(document.cookie)` does not show `session`. This shop's cookie is `HttpOnly`, as in the [Cookies](../Cookies/) lab, so page script cannot read it. The script on this page still runs. HttpOnly limits what the script can see. It does not stop the script.

### 4. Enable the escape (uncomment)

At the top of [`server/src/comments.ts`](server/src/comments.ts), find `USE_SAFE_HTML`:

1. Comment out: `const USE_SAFE_HTML = false;`
2. Uncomment: `// const USE_SAFE_HTML = true;`
3. Restart `npm run dev` (in-memory opinions are cleared).

Repeat exercise **3**. Expected: the payload is visible as text, and there is no alert. Exercise **1** still shows the plain sentence.

The escape replaces `&`, `<`, `>`, and `"` in the login and the opinion.
