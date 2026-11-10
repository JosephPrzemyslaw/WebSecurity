# XSS

This folder is the stored XSS lab. One page takes a comment, stores it, and writes it back into the HTML.

`POST /comments` saves the comment text in the `comments` table. `GET /` reads `server/pages/members.html` and replaces `<!-- COMMENTS -->` with a snippet built in a loop in `server/src/index.ts`. The comment body is inserted as HTML, with no escaping and no template engine.

The app is already in this folder. Install dependencies and start the server. It listens on port 3002.

- **Frontend:** HTML and CSS. The page is sent by the `/` route. CSS is served from `server/public/`
- **Backend:** Node.js + Express + TypeScript
- **Database:** in-memory SQLite (`node:sqlite`, `:memory:`). The schema is in `server/sql/init.sql`. Each start loads a fresh database.

## Prerequisites

1. **Node.js 22+** (includes npm): [https://nodejs.org](https://nodejs.org). This lab is written for Node 26.5 (`DatabaseSync`).
2. A terminal and a browser

```bash
cd server
npm install
npm run dev
```

Open http://localhost:3002.

## Project layout

```text
XSS/
  README.md
  server/
    src/index.ts
    src/db.ts
    pages/members.html
    public/style.css
    sql/init.sql
```
