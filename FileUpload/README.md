# File upload (chapter 6)

Member shop continuation from **[XSS](../XSS/)** (chapter 5, port **3002**). The same app on port **3005** adds **profile photo upload** on `/account` (`POST /account/avatar` → `public/uploads/`, CWE-434). Earlier shop features (catalog, search, opinions, chapter download) remain.

- **Port:** `3005`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123` (admin)
- **Stack:** Express + TypeScript + **multer**, in-memory SQLite. Restarting `npm run dev` clears in-memory avatar paths (files in `public/uploads/` stay on disk until you delete them).

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3005/login`**.

## Layout

```text
FileUpload/
  README.md
  samples/evil.html, evil.svg   # ready files for exercise 2
  server/
    pages/account.html
    src/upload.ts                 # USE_SAFE_UPLOAD
    src/routes/account.ts
    public/uploads/
```

| Request | Meaning |
|---------|---------|
| `POST /account/avatar` | Saves file under `public/uploads/` |
| `GET /uploads/…` | Static file (Express `public/`) |

`USE_SAFE_UPLOAD` in [`server/src/upload.ts`](server/src/upload.ts) controls validation and filename generation.

## Exercises

**CWE-434** · debrief: [PathTraversal](../PathTraversal/) = **read** a chapter; this lab = **write** into web-served `uploads/`.

### 1. Legal image

Sign in as `marc` → **Your account** → upload a small **PNG** or **JPEG**. The preview appears on `/account`.

### 2. HTML or SVG (not an image)

Still signed in as `marc`. Upload one sample from [`samples/`](samples/) (or your own copy):

| File | What to check |
|------|----------------|
| [`evil.html`](samples/evil.html) | Click **Open uploaded file** (or open the same path in the address bar). **Bold text** is pasted as HTML, not escaped. |
| [`evil.svg`](samples/evil.svg) | On `/account`, the **profile photo uses `<img>`** — SVG script does **not** run there (safe). Scroll to **Anti-pattern (do not ship)**: the lab’s intentional **`<iframe>`** can run script in that frame. Also **Open uploaded file**. |

**Debrief (SVG):** The normal UI is **`&lt;img&gt;`** (realistic and safe for script). The dashed **anti-pattern** block shows what **not** to do when previewing uploads. The core CWE-434 issue is still **hosting** the file on your origin — **Open uploaded file** / shared `/uploads/…` links matter even when the avatar stays an image. **Chrome** may restrict some SVG script in iframe; use [`evil.html`](samples/evil.html) if you need a loud demo.

**Debrief (HTML):** Same pattern as XSS on opinions, but the payload arrived via **upload**, not a comment.

### 3. Enable safe upload (uncomment)

At the top of [`server/src/upload.ts`](server/src/upload.ts):

1. Comment out: `const USE_SAFE_UPLOAD = false;`
2. Uncomment: `// const USE_SAFE_UPLOAD = true;`
3. Restart `npm run dev`. Delete old files in `server/public/uploads/` if needed.

Repeat exercise **2**. Expected: upload rejected or saved only as a random **.jpg** / **.png** name; HTML/SVG payloads should not be accepted.

## Next steps

**Previous:** XSS — opinions and search (CWE-79).

A future **open redirect** lab (CWE-601) may extend this shop.