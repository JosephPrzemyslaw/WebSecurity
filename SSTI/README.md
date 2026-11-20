# Server-side template injection — SSTI (chapter 9)

From **[HtmlInjection](../HtmlInjection/)** (port **3007**). **Port 3008.** Profile HTML/CSS, upload, redirect, and opinions are safe. New: **EJS** on **Shipping label preview** (`/account`).

Accounts: `marc` / `marc123`.

| Piece | Location |
|-------|----------|
| User-controlled **template** | `POST /account/shipping` |
| Server **data** in render | `login`, `orderRef` (e.g. `MS-marc-GWTW`) |
| Flag | `USE_SAFE_SSTI` in `server/src/ssti.ts` |

## Run

```bash
cd server && npm install && npm run dev
```

`http://localhost:3008/login` → **Your account** → **Shipping label preview**.

## Exercises

Keep **`USE_SAFE_SSTI = false`** until **Fix**.

### 1. Proof — code runs on the server

Replace the template with:

```ejs
<p>Test: <%= 7*7 %></p>
<p>Ship to: <%= login %></p>
```

**Render preview.** **Expected:** `Test: 49` (not the literal `<%= 7*7 %>`).

### 2. Data vs template

Add:

```ejs
<p>Order: <%= orderRef %></p>
```

You control the **template text**; the server still injects **fields** (`orderRef` is not in your textarea as a value — it is evaluated when EJS runs).

### 3. Not HTML injection

On this port, **bio is escaped** (chapter 8 fixed). Put the same line in **Public profile → Bio**:

```html
<p><%= 7*7 %></p>
```

**Expected on `/account` preview:** visible characters `<%=` … `%>` — no `49`.

Put the **same string** in the **EJS template** and render again → **`49`**.

**Takeaway:** context matters — HTML sink vs **template engine** on the server.

### Fix

Set **`USE_SAFE_SSTI = true`** in `ssti.ts`, restart. Preview always uses the **built-in** label; user template is not executed.

Do not aim RCE payloads at shared hosts; read [OWASP SSTI](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server-side_Template_Injection) for impact on other stacks.

**Slides:** [`presentation/`](presentation/README.md) · **Next:** [SSRF](../SSRF/) (port **3009**).