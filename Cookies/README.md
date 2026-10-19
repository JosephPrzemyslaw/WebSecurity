# Cookies

This folder is the cookie lab. It starts as the sign-in app. Cookie work is added here.

A successful sign-in sets a `session` cookie and redirects to `/members`. The server remembers that session in memory. Opening `/members` without it redirects to `/login`.

The app is already in this folder. Install dependencies and start the server.

- **Frontend:** HTML, CSS, and vanilla JavaScript. Pages are sent by routes. CSS and `login.js` are served from `server/public/`
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
    src/session.ts
    sql/init.sql
    pages/
      login.html      # sign-in form, served at /login
      members.html    # members page, served at /members
    public/
      login.js        # shows the sentence for ?error=invalid or ?error=server
      style.css
```

## Run

```bash
cd server
npm install
npm run dev
```

Open `http://localhost:3000/login`. Sign in as `ewa` / `ewa123` or `marc` / `marc123` (passwords stored as plain text for now).

The form is `method="POST"` and `action="/login"`, so `login` and `password` travel in the request body. A match redirects to `/members`. A rejected sign-in redirects to `/login?error=invalid`.

Passwords in `sql/init.sql` are plain text. Restarting the server rebuilds the in-memory database from that file and clears the session map.

This server uses port `3000`.
