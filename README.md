# WebSecurity

Work through the labs in **chapter order** (1–6). **Ports** are fixed so you can run different apps in parallel; chapter number is not the same as the port digit (e.g. chapter 5 is port **3002**, chapter 6 is **3005**).

**Training day agenda** (different topic order on slides) vs **repo storyline**: see [`docs/WORKSHOP-ORDER.md`](docs/WORKSHOP-ORDER.md). Planned modules (Open Redirect, SSTI, SSRF): [`docs/WORKSHOP-ROADMAP.md`](docs/WORKSHOP-ROADMAP.md).

**SQL injection** is a separate login app. The **member shop** story starts in **Cookies** and gains new features each chapter.

| Ch. | Folder | Topic | Port |
|-----|--------|--------|------|
| 1 | [SQLInjection/](SQLInjection/) | SQL injection (login) | **3000** |
| 2 | [Cookies/](Cookies/) | Cookie flags, SameSite, buy | **3001** |
| 3 | [CSRF/](CSRF/) | CSRF token, forged POST/GET | **3003** |
| 4 | [PathTraversal/](PathTraversal/) | Path traversal (chapter read); uploads placeholder | **3004** |
| 5 | [XSS/](XSS/) | Stored + reflected XSS; optional `key-receiver/` on **4000** (exercise 4) | **3002** |
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