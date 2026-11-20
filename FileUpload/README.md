# File upload (chapter 6)

Member shop continuation from **[XSS](../XSS/)** (chapter 5, port **3004**). The same app on port **3005** adds **profile photo upload** on `/account` (`POST /account/avatar` → `public/uploads/`, CWE-434). Earlier shop features (catalog, search, opinions, chapter download) remain.

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
  samples/evil.html, evil.svg   # exercise 2; exercise 4 reuses evil.html
  server/
    pages/account.html
    src/upload.ts                 # USE_SAFE_UPLOAD, VERIFY_IMAGE_MAGIC_BYTES
    src/imageMagic.ts             # JPEG/PNG signature check (exercise 5)
    src/routes/account.ts
    public/uploads/
```

| Request | Meaning |
|---------|---------|
| `POST /account/avatar` | Saves file under `public/uploads/` |
| `GET /uploads/…` | Static file (Express `public/`) |

`USE_SAFE_UPLOAD` and `VERIFY_IMAGE_MAGIC_BYTES` in [`server/src/upload.ts`](server/src/upload.ts) control MIME whitelist, magic-byte checks, and filename generation.

## Exercises

**CWE-434** · [PathTraversal](../PathTraversal/) = **read** a chapter from disk; this lab = **write** into web-served `uploads/`.

Keep **`USE_SAFE_UPLOAD = false`** for exercises **1–2**.

### 1. Legal image

Sign in as `marc` → **Your account** → upload a small **PNG** or **JPEG**.

On `/account` you get a normal **profile photo** in `<img>` plus **Open uploaded file**. There is **no** anti-pattern iframe block for JPEG/PNG (only real image previews use `<img>`).

### 2. HTML or SVG (not an image)

Still signed in as `marc`. Upload **one** sample from [`samples/`](samples/) (or your own copy). After each step, stay on `/account` unless noted.

**Shared steps (every non-JPEG/PNG upload):**

1. **Profile photo** — the shop shows the file in `<img>` only (production-style). For [`evil.html`](samples/evil.html) you usually get a broken image icon. For [`evil.svg`](samples/evil.svg) you may see the picture, but **no** `alert` — scripts do not run inside `<img>` (by design).
2. **Anti-pattern (do not ship)** — dashed box with an `<iframe src="/uploads/…">` on purpose. Some products preview attachments in a frame; that can run SVG/HTML as a **document** on this origin. This is **not** how you should build an avatar UI.
3. **Open uploaded file** — opens the same URL in a new tab (realistic attack path: hostile file **hosted** on the shop origin).

**Variant A — HTML**

Upload [`evil.html`](samples/evil.html). Click **Open uploaded file** (or paste the `/uploads/evil.html` URL). The file runs as a **full page** on this origin: a red **urgent** banner appears (same class as the stored-XSS demo in the [XSS](../XSS/) lab), powered by `<script>` in the uploaded file. The anti-pattern **iframe** on `/account` shows the same effect without leaving the account page. Payload arrived via **upload**, not an opinion field.

Optional: sign in as `ewa`, open a link `http://localhost:3005/uploads/evil.html` that `marc` shared — same trusted domain, same effect.

**Variant B — SVG**

Upload [`evil.svg`](samples/evil.svg). In the **anti-pattern** iframe, script may run (e.g. `alert(document.domain)`). In `<img>` it does not. **Chrome** sometimes blocks script in external SVG even in an iframe; if it stays quiet, rely on **variant A** for a loud demo.

**Debrief**

- The vulnerability class is **accepting and serving** unexpected files under `/uploads/…`, not only “what the avatar `<img>` does”.
- `<img>` is safe for script; **documents** (new tab, iframe, attachment preview) are not.
- In production, avatars should use `<img>` only; the iframe block exists in the lab to show what **not** to ship.

### 3. Enable safe upload (uncomment)

`USE_SAFE_UPLOAD` must stay **off** for exercises **1–2** and the **instructor DoS demo**. Leave it **on** for exercises **3–5** (keep magic bytes **off** for **3–4** only).

At the top of [`server/src/upload.ts`](server/src/upload.ts):

1. Comment out: `const USE_SAFE_UPLOAD = false;`
2. Uncomment: `// const USE_SAFE_UPLOAD = true;`
3. Restart `npm run dev`. Delete old files in `server/public/uploads/` if needed so stale `evil.html` URLs do not confuse the demo.

The server then accepts only multipart parts whose `Content-Type` is **`image/jpeg`** or **`image/png`**. It **ignores** the original filename and saves as `{login}-{uuid}.jpg` or `.png` (extension comes from that MIME, not from file bytes).

Repeat exercise **2** (upload [`evil.html`](samples/evil.html) or [`evil.svg`](samples/evil.svg) normally). Expected: **Upload failed** on `/account`; **no** new HTML/SVG file in `server/public/uploads/`. Old files from exercise 2 may still be reachable until you delete them.

This fix is a **first step** only; exercise **4** shows that trusting **client-supplied MIME** is not content validation.

### 4. MIME spoof — junk on disk (after exercise 3)

Leave **`USE_SAFE_UPLOAD = true`**.

1. Upload [`evil.html`](samples/evil.html) through the normal form → **failed** (same as exercise 3).
2. Repeat the upload through **Burp** (intercept `POST /account/avatar`) and change the file part’s header to **`Content-Type: image/jpeg`**. Body stays the HTML from `evil.html`.

**Expected (UI):** Upload succeeds. Profile photo is a broken `<img>` — **no** urgent banner on `/account` itself (only the broken image). No anti-pattern iframe (`.jpg` is treated like a real image extension). **Open uploaded file** usually does **not** run the HTML demo (response is served as an image type) — contrast with exercise 2.

**Expected (proof):** In `server/public/uploads/`, a new `marc-*.jpg` whose **contents** are still the HTML document (e.g. `cat server/public/uploads/marc-*.jpg` shows `<script>` / `shop-notice--urgent`, not JPEG bytes). Whitelist MIME was bypassed; **garbage landed in a public web directory**.

**Debrief:** Production needs **magic-byte** checks or re-encoding (e.g. sharp), not MIME from the browser alone. Here the lesson is **disk + origin**, even when the shop UI looks fine.

### 5. Magic-byte check (after exercise 4)

Leave **`USE_SAFE_UPLOAD = true`**. In [`server/src/upload.ts`](server/src/upload.ts):

1. Comment out: `const VERIFY_IMAGE_MAGIC_BYTES = false;`
2. Uncomment: `// const VERIFY_IMAGE_MAGIC_BYTES = true;`
3. Restart `npm run dev`.

The server still whitelists MIME types, but now also checks **file signatures** in [`server/src/imageMagic.ts`](server/src/imageMagic.ts) (JPEG `FF D8 FF`, PNG standard header). Declared `Content-Type` must match those bytes.

Repeat exercise **4** (Burp: `Content-Type: image/jpeg`, body still `evil.html`). **Expected:** **Upload failed** — spoofed MIME no longer enough.

Upload a real **JPEG** or **PNG** again. **Expected:** succeeds as in exercise **1**.

**Debrief:** Leading magic bytes alone are not a full security story (attackers may prepend `GIF89a` or fake headers). Production should **re-encode** or decode with a hardened library, not only read the first few bytes.

### Demo — DoS via many uploads (ZAP / Burp, localhost only)

With both upload flags **off**, fuzz `POST /account/avatar`: vary **`filename`** (e.g. `quota-demo-N.jpg`) so files accumulate under `server/public/uploads/`. Slide: [`presentation/historical-cases/illustrations/hist-dos-upload-flood-story-720p.png`](presentation/historical-cases/illustrations/hist-dos-upload-flood-story-720p.png). Prefer **ZAP Fuzzer** over throttled Burp Community Intruder.

## Next steps

**Previous:** XSS — opinions and search (CWE-79).

**Next:** [OpenRedirect](../OpenRedirect/) (CWE-601, port **3006**).