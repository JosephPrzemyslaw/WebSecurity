# Server-side template injection — SSTI (chapter 9)

Continuation from **[HtmlInjection](../HtmlInjection/)** (chapter 8, port **3007**). Port **3008**. Profile HTML/CSS, upload, redirect, and opinions are hardened; this chapter adds **EJS** on **shipping label preview**.

- **Port:** `3008`
- **Accounts:** `marc` / `marc123`, `ewa` / `ewa123`
- **Stack:** Express + TypeScript + **ejs**

## Run

```bash
cd server
npm install
npm run dev
```

Open **`http://localhost:3008/login`** → **Your account** → **Shipping label preview**.

## Layout

```text
SSTI/
  server/src/ssti.ts          # USE_SAFE_SSTI, ejs.render(userTemplate)
  server/src/routes/account.ts # POST /account/shipping
```

| Request | Meaning |
|---------|---------|
| `POST /account/shipping` | Save EJS template, re-render preview on `GET /account` |

Context object (fixed by server): `login`, `orderRef` (e.g. `MS-marc-GWTW`).

## Exercises

**CWE-1336** · Keep **`USE_SAFE_SSTI = false`** for exercises **1–2**.

### 1. Prove template execution

On **Your account**, replace the template with:

```ejs
<p>Test: <%= 7*7 %></p>
<p>Ship to: <%= login %></p>
```

**Render preview**. **Expected:** `Test: 49` in the preview (not the literal `<%= 7*7 %>`).

### 2. Server-side context

Add lines such as:

```ejs
<p>Order ref from server: <%= orderRef %></p>
```

Discuss: attacker controls **template source**, server still supplies **data** — classic SSTI differs from simple `{{variable}}` substitution only when the user controls the template text.

### 3. Impact debrief (localhost only)

Optional on your machine: look up **EJS** SSTI/rce write-ups. This lab is intentionally small; do **not** aim destructive payloads at shared hosts. Compare with [OWASP WSTG — Testing for Server Side Template Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server-side_Template_Injection).

### 4. Fix

In `server/src/ssti.ts`:

1. Comment out `export const USE_SAFE_SSTI = false;`
2. Uncomment `// export const USE_SAFE_SSTI = true;`
3. Restart `npm run dev`.

**Expected:** preview always uses the **built-in** label; editing the textarea no longer changes rendered output (or only safe re-save of built-in).

Defense: never `render()` user-controlled template strings; bind **data** only; use a logic-less format or sandbox.

**Slides:** [`presentation/`](presentation/README.md)

## Previous / next

**Previous:** [HtmlInjection](../HtmlInjection/) (HTML/CSS).

**Next:** SSRF (chapter 10, not in repo yet) — slides in `SSRF/presentation/` when the lab lands.