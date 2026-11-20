# Server-side request forgery — SSRF (chapter 10)

From **[SSTI](../SSTI/)** (port **3008**). **Port 3009.** Earlier chapter vulns are safe. New: the shop **server** `fetch`es a URL you pass on **`/members`**.

Accounts: `marc` / `marc123`.

| Piece | Location |
|-------|----------|
| Trigger | `GET /members?coverUrl=` |
| Flag | `USE_SAFE_SSRF` in `server/src/ssrf.ts` |

## Run

```bash
cd server && npm install && npm run dev
```

`http://localhost:3009/login` → **Your library** → **Import cover from URL**.

## Exercises

Keep **`USE_SAFE_SSRF = false`** until **Fix**.

### 1. Who performs the HTTP request?

In **Image URL**, submit:

```text
http://127.0.0.1:3008/login
```

**Expected:** preview shows **status + HTML snippet** — the app on **3009** fetched `:3008`. Your browser tab stayed on **3009** (you did not navigate to `:3008` yourself).

**Takeaway:** attacker moves the **server’s** trust boundary, not only the victim’s browser.

### 2. Hit a URL that is not in the menu

The app exposes an internal check (no nav link):

```text
http://127.0.0.1:3009/internal/health
```

**Expected:** plain body with `catalog-sync-token=…` in the preview. Same path in the **address bar** still needs a running server; the point is **you chose** a loopback target and the **backend** requested it.

On cloud VMs, the same pattern applies to metadata IPs — see slide `02-ssrf-metadata.png` in [`presentation/`](presentation/README.md).

### 3. Fix

Set **`USE_SAFE_SSRF = true`**, restart. Retry **1** and **2** → blocked. A public image URL (e.g. `https://upload.wikimedia.org/...jpg`) may still work.

**Slides:** [`presentation/`](presentation/README.md)