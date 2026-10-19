# Cookies

This folder is the cookie lab. It starts as the sign-in app. Cookie work is added here.

No session cookie is set yet. A successful sign-in only redirects to `/members.html`.

The app is already in this folder. Install dependencies and start the server.

- **Frontend:** HTML + vanilla JavaScript, served by Express from `server/public/`
- **Backend:** Node.js + Express + TypeScript
- **Database:** in-memory SQLite (`node:sqlite`, `:memory:`). Schema and users are in `server/sql/init.sql`. Each `npm run dev` loads a fresh database.

Application logic on the server is TypeScript (`.ts`). The browser files are HTML, CSS, and JavaScript.

## Supported platforms

macOS, Windows, and Ubuntu.

- Start the app with `npm run dev` (`node --watch src/index.ts`).
- SQLite uses Node’s `node:sqlite` (`DatabaseSync` on Node 26.5). Not `better-sqlite3`.
- On Windows use PowerShell or the editor terminal.

## Prerequisites

1. **Node.js 22+** (includes npm): [https://nodejs.org](https://nodejs.org). This lab is written for Node 26.5 (`DatabaseSync`).
2. A terminal and a browser

```bash
node -v
npm -v
```

## Project layout (already in git)

```text
Cookies/
  README.md
  server/
    src/index.ts
    src/db.ts
    sql/init.sql
    public/
      login.html      # sign-in form
      login.js        # shows the sentence for ?error=invalid or ?error=server
      members.html
      style.css
```

## Run

```bash
cd server
npm install
npm run dev
```

Open `http://localhost:3000/login.html`. Sign in as `ewa` / `ewa123` or `marc` / `marc123` (passwords stored as plain text for now).

The form is `method="POST"` and `action="/login"`, so `login` and `password` travel in the request body. A match redirects to `/members.html`. A rejected sign-in redirects to `/login.html?error=invalid`.

Passwords in `sql/init.sql` are plain text. Restarting the server rebuilds the in-memory database from that file.

This server uses port `3000`.
