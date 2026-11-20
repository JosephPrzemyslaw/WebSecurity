# Server-side request forgery — SSRF (chapter 10)

Continuation from **[SSTI](../SSTI/)** (chapter 9, port **3008**). Port **3009**. Profile HTML/CSS, upload, redirect, opinions, and EJS shipping label are hardened; this chapter adds a server **HTTP fetch** when you import a **cover image URL** on **`/members`**.

- **Port:** `3009`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123`
- **Stack:** Express + TypeScript (`fetch` on the server)

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3009/login`** → **Your library** → **Import cover from URL**.

## Layout

```text
SSRF/
  server/src/ssrf.ts           # USE_SAFE_SSRF, fetchCoverForLab()
  server/src/routes/members.ts # GET /members?coverUrl=
```

| Request | Meaning |
|---------|---------|
| `GET /members?coverUrl=` | Server fetches URL, shows status/body or image preview |

## Exercises

**CWE-918** · Keep **`USE_SAFE_SSRF = false`** for exercises **1–2**.

### 1. Loopback / internal port

With the lab running on **3009**, try fetching another local service, for example:

`http://127.0.0.1:3008/login`

**Expected:** the **SSRF** app’s server performs the request; you see HTML (or a snippet) in the preview — not your browser talking to `:3008` directly.

### 2. Metadata-style host (discussion)

Try URLs such as `http://169.254.169.254/` on a cloud VM, or read slide **02** in [`presentation/`](presentation/README.md). On this laptop lab, focus on **why** the trust boundary moved: the **server** is the client.

### 3. Fix

In `server/src/ssrf.ts`:

1. Comment out `export const USE_SAFE_SSRF = false;`
2. Uncomment `// export const USE_SAFE_SSRF = true;`
3. Restart `npm run dev`.

**Expected:** private/loopback/link-local targets are **blocked** with the policy message; public `https://` image URLs may still work.

Defense: allow-lists, blocklists, no raw user URLs, separate fetch proxy with egress controls.

**Slides:** [`presentation/`](presentation/README.md)

## Previous

**Previous:** [SSTI](../SSTI/) (EJS label, port **3008**).