# HTML & CSS injection (chapter 8)

One folder for both topics: **untrusted data becomes part of the page** (tags or style), without focusing on **JavaScript** — that stays in **[XSS](../XSS/)** (chapter 5).

Continuation from **[OpenRedirect](../OpenRedirect/)** (chapter 7, port **3006**). Port **3007**. Upload, redirect, and **opinions** are already hardened; this chapter adds **profile bio** (HTML) and **accent color** (CSS in an inline `style`).

- **Port:** `3007`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123`
- **Stack:** Express + TypeScript, in-memory profile fields (restart clears bios/accents)

## Why one directory?

| Topic | Field | Sink |
|--------|--------|------|
| **HTML injection** | `bio` textarea | `<div class="profile-bio-preview">…</div>` on `/members` |
| **CSS injection** | `accent` input | `style="border-left-color: …"` on spotlight card |

Same feature (public profile), two sinks, two flags in [`server/src/profileInjection.ts`](server/src/profileInjection.ts).

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3007/login`**.

## Layout

```text
HtmlInjection/
  README.md
  server/
    src/profileInjection.ts   # USE_SAFE_PROFILE_HTML, USE_SAFE_PROFILE_CSS
    src/routes/account.ts     # POST /account/profile
    src/routes/members.ts     # Reader spotlight
```

| Request | Meaning |
|---------|---------|
| `POST /account/profile` | Save `bio` and/or `accent` |
| `GET /members` | **Reader spotlight** shows other members’ bios and accents |

Opinions still use `POST /comments` but are **escaped** (`USE_SAFE_HTML = true` in `comments.ts`).

## Exercises — HTML (CWE-80 / markup)

Flags: keep **`USE_SAFE_PROFILE_HTML = false`** for exercises **1–3**.

### 1. Bold and links

Sign in as **marc** → **Your account**. In **Bio**, save:

```html
<p><b>Staff pick</b> — <a href="https://example.com/free-books">Download free PDFs here</a></p>
```

On `/account`, the preview renders real HTML. Sign in as **ewa** → **Library**. Under **Reader spotlight**, marc’s bio shows a **clickable off-site link** (phishing / defacement without `<script>`).

### 2. Structure / defacement

As **marc**, set bio to:

```html
<h1>SALE — Everything 1 zł</h1>
```

**ewa** on `/members` sees the heading in another user’s profile (integrity of the page).

### 3. Debrief vs XSS

Compare with [XSS](../XSS/) exercise 1: same `<b>` in **opinions** there; here **opinions are escaped** on this port. This lab is **markup and style**, not `onerror` / `<script>`.

## Exercises — CSS injection

Keep **`USE_SAFE_PROFILE_CSS = false`** for exercises **4–5** (HTML flag can stay off or on).

### 4. Extra declarations in `style`

As **marc**, set **Accent color** to:

```text
crimson; background: #fff3cd; padding: 2rem
```

Reload **ewa**’s `/members`. The spotlight card picks up extra CSS from the injected attribute (browser applies multiple declarations in one `style=""`).

### 5. Stronger visual abuse (optional)

Try a long outline, e.g. `red; outline: 16px solid orange` — discuss UI redress / distraction.

## Fix

In `server/src/profileInjection.ts`:

1. Set `USE_SAFE_PROFILE_HTML = true` (escape bio; show as text).
2. Set `USE_SAFE_PROFILE_CSS = true` (allow only `#rgb` / simple color names).
3. Restart `npm run dev`. Repeat exercises 1 and 4 — markup and CSS tricks should fail or sanitize.

## Previous / next

**Previous:** [OpenRedirect](../OpenRedirect/) (CWE-601).

**Next:** use existing chapters from the [root README](../README.md) (SSTI/SSRF not in repo yet).