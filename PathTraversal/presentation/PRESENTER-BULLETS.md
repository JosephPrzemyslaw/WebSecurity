# Path traversal — presenter bullets (English)

## What it is

- User input becomes part of a **file path** on the server.
- `../` (or encoded variants) escapes the intended directory.
- Attacker **reads** files they should not (config, keys, source).

## Case story (three cards — when slides exist)

- **1. User requests a chapter** — legitimate `GET …/chapters/chapter-01.txt`.
- **2. Server joins paths naively** — `chapters/` + user-supplied segment without normalization.
- **3. Secret on disk** — response body is `.gitignore`, env, or internal CSV.

## Lab exercises (this repo)

- Exercise 1: legal download after login.
- Exercise 2: `../../../../../.gitignore` in the path (browsers may normalize — use `curl --path-as-is` or encoded traversal).
- Exercise 3: `%2f` encoding in one segment.
- Exercise 4: `USE_SAFE_CHAPTER_PATH` — reject `..` and absolute paths.

## Tie-in from File Upload

- Upload lab **writes** into `public/uploads/` (CWE-434).
- Path lab **reads** outside `content/…/chapters/` (CWE-22).
- Defense: allow-list basenames, canonical path under a root, no user-controlled `../`.

## Links

- OWASP WSTG — testing path traversal
- CWE-22 Improper Limitation of a Pathname to a Restricted Directory