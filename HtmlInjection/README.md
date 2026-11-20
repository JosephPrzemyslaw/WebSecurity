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

### 4. OWASP WSTG — stored `<form>` (HTML injection → same-origin action)

Maps to [WSTG-CLNT-03 HTML Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/03-HTML_Injection) (*markup without script* can still change behaviour).

As **marc**, set bio to:

```html
<p>Member perk:</p>
<form method="POST" action="/buy">
  <input type="hidden" name="bookId" value="1" />
  <button type="submit">Claim free book</button>
</form>
```

Sign in as **ewa** → **Library** → **Reader spotlight**. She did not use the catalog **Buy** form, but the button in marc’s bio is a real `POST /buy` in **her** session. **Expected:** after she submits, she owns the title (same as pressing **Buy now**). Debrief: forged UI + same-origin POST — related to [CSRF](../CSRF/), but here the HTML is **stored** in another user’s field.

### 5. OWASP WSTG — embed external document (`<iframe>`)

Still on [WSTG HTML Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/03-HTML_Injection): injected markup the browser treats as active content.

As **marc**:

```html
<iframe src="https://example.com" title="Partner promo" width="280" height="120"></iframe>
```

**ewa** sees third-party content framed inside your shop. Discuss CSP `frame-src` / avoiding raw HTML in profiles.

## Exercises — CSS injection

Keep **`USE_SAFE_PROFILE_CSS = false`** for exercises **6–8** (HTML flag can stay off or on).

### 6. Extra declarations in `style` (style-attribute injection)

As **marc**, set **Accent color** to:

```text
crimson; background: #fff3cd; padding: 2rem
```

Reload **ewa**’s `/members`. The spotlight card picks up extra CSS from the injected attribute (browser applies multiple declarations in one `style=""`).

See [WSTG-CLNT-05 CSS Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/05-CSS_Injection) — user-controlled value reaches a **style** sink.

### 7. OWASP WSTG — `background` / outbound request (lab-safe)

[WSTG CSS Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/05-CSS_Injection) describes exfiltration via `background` / `url()`. In a full lab you might use Burp Collaborator; here use a harmless probe:

```text
crimson; background-image: url(https://example.com/css-probe.gif)
```

Open **ewa**’s `/members` and watch DevTools → **Network** (or server logs on `example.com` if you control it). **Expected:** browser may request the image when painting the card. Debrief: blind CSS exfil is a separate advanced topic; our sink is a single `style=""` on one card, not a full stylesheet.

### 8. UI redress (optional)

```text
red; outline: 9999px solid rgba(0,0,0,0.08); outline-offset: -8px
```

Discuss distraction / fake emphasis — still [WSTG](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/05-CSS_Injection) *impact*, not RCE.

## Fix

In `server/src/profileInjection.ts`:

1. Set `USE_SAFE_PROFILE_HTML = true` (escape bio; show as text).
2. Set `USE_SAFE_PROFILE_CSS = true` (allow only `#rgb` / simple color names).
3. Restart `npm run dev`. Repeat exercises **1**, **4** (form), and **6** — markup and CSS tricks should fail or sanitize.

## OWASP reading (no extra repo overhead)

| Guide | Use on this lab |
|-------|------------------|
| [WSTG — HTML Injection (4.11.3)](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/03-HTML_Injection) | Exercises **4–5** (form, iframe) |
| [WSTG — CSS Injection (4.11.5)](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/05-CSS_Injection) | Exercises **6–8** |
| [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | Context-specific encoding (HTML vs CSS) |

We do **not** duplicate XSS script labs here; use [XSS](../XSS/) for `<script>` / event handlers.

## Previous / next

**Previous:** [OpenRedirect](../OpenRedirect/) (CWE-601).

**Next:** use existing chapters from the [root README](../README.md) (SSTI/SSRF not in repo yet).