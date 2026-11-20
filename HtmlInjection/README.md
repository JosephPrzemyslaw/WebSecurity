# HTML & CSS injection (chapter 8)

Markup and **style** in the page — **not** JavaScript ([XSS](../XSS/) is chapter 5).

From **[OpenRedirect](../OpenRedirect/)** (port **3006**). **Port 3007.** Upload, redirect, and opinions are already safe; new fields: **bio** (HTML) and **accent** (CSS in `border-left-color`).

| Flag | File | Sink |
|------|------|------|
| `USE_SAFE_PROFILE_HTML` | `server/src/profileInjection.ts` | bio in **Reader spotlight** on `/members` |
| `USE_SAFE_PROFILE_CSS` | same | `style="border-left-color: …"` on spotlight card |

Accounts: `marc` / `marc123`, `ewa` / `ewa123`.

## Run

```bash
cd server && npm install && npm run dev
```

`http://localhost:3007/login` → **Your account** (edit profile) or **Library** (see others).

## Exercises

Keep **both flags `false`** until **Fix**.

### 1. Stored HTML — integrity & phishing

**marc** → **Your account** → **Bio**:

```html
<p><b>Staff pick</b> — <a href="https://example.com">Free member PDFs</a></p>
```

**ewa** → **Library** → **Reader spotlight**. She sees real HTML in marc’s card (link works; no `<script>`).

**Takeaway:** stored markup changes what **other users** trust on your site.

### 2. Stored HTML — forged action

**marc**, bio:

```html
<p>Perk:</p>
<form method="POST" action="/buy">
  <input type="hidden" name="bookId" value="1" />
  <button type="submit">Claim free book</button>
</form>
```

**ewa** on `/members` did not use **Buy now**, but the button is a real `POST /buy` in **her** session → she can own the title.

**Takeaway:** HTML injection can drive **same-origin** requests ([CSRF](../CSRF/) uses another site; here the bad HTML is **stored**).

### 3. CSS in one `style` attribute

**marc**, **Accent color**:

```text
crimson; background: #fff3cd; padding: 1.5rem
```

**ewa** → `/members`: extra rules apply inside the spotlight card (`style=""` injection).

**Optional:** `background-image: url(https://example.com/x.gif)` and watch DevTools **Network** — browser loads the URL when painting the card ([WSTG CSS injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side/05-CSS_Injection)).

### Fix

In `profileInjection.ts` set **`USE_SAFE_PROFILE_HTML = true`** and **`USE_SAFE_PROFILE_CSS = true`**, restart.

Repeat **1** and **2**: bio should show **text**, not tags; accent only allows simple colours.

**Slides:** [`presentation/`](presentation/README.md) · **Next:** [SSTI](../SSTI/) (port **3008**).