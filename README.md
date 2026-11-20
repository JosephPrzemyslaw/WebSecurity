# WebSecurity

Each chapter has a fixed port: **port = 3000 + (chapter − 1)** (chapter 1 → **3000**, chapter 6 → **3005**). You can run several labs in parallel on different ports.

On the course you can teach **any topic in any order** — the table below is the shop **storyline** in the repo, not a mandatory slide sequence. Many workshops **start with SQL injection** (chapter 1).

**SQL injection** is a separate login app. The **member shop** story starts in **Cookies** and gains new features each chapter.

| Ch. | Folder | Topic | Port |
|-----|--------|--------|------|
| 1 | [SQLInjection/](SQLInjection/) | SQL injection (login) | **3000** |
| 2 | [Cookies/](Cookies/) | Cookie flags, SameSite, buy | **3001** |
| 3 | [CSRF/](CSRF/) | CSRF token, forged POST/GET | **3002** |
| 4 | [PathTraversal/](PathTraversal/) | Path traversal (chapter read); uploads placeholder | **3003** |
| 5 | [XSS/](XSS/) | Stored + reflected XSS; optional `key-receiver/` on **4000** (exercise 4) | **3004** |
| 6 | [FileUpload/](FileUpload/) | Unrestricted file upload (avatar → `public/uploads/`) | **3005** |

### What each chapter adds (shop line)

1. **SQL** — vulnerable login query (not the full shop yet).
2. **Cookies** — member shop: login, **Buy**, support chatbot, cross-site partner page.
3. **CSRF** — shop nav, **/account**, **/team**, synchronizer token, partner HTML.
4. **Path traversal** — **chapter download** (`GET …/chapters/…`), traversal target file.
5. **XSS** — catalog + **search**, **opinions**, key receiver helper.
6. **File upload** — **avatar** on `/account`, files under **`/uploads`**.

Clone this repository, then open the README in the lab folder you are working on. Install dependencies under each lab’s `server/` and run `npm run dev`.

All rights reserved. This material is provided for the workshop.