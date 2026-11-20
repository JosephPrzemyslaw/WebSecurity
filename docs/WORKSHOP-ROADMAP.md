# Workshop roadmap — missing and planned modules

Status relative to the training agenda. **Done** = lab + README; **Slides** = optional deck like File Upload historical cases.

| Agenda topic | Repo | Port | Status | Notes |
|--------------|------|------|--------|--------|
| HTML / CSS injection | (with XSS) | 3002 | **Partial** | Stored HTML/SVG in [XSS](../XSS/); no standalone chapter |
| XSS | [XSS/](../XSS/) | 3002 | **Done** | Stored + reflected |
| CSRF | [CSRF/](../CSRF/) | 3003 | **Done** | Token + partner pages |
| Open Redirect | — | — | **Planned** | CWE-601; natural after shop links / post-login redirect ([FileUpload README](../FileUpload/README.md) mentions future lab) |
| File Upload | [FileUpload/](../FileUpload/) | 3005 | **Done** | Lab 1–5, DoS demo, watercolor case deck |
| Path traversal | [PathTraversal/](../PathTraversal/) | 3004 | **Lab done** | Presentation deck not started |
| SQL injection | [SQLInjection/](../SQLInjection/) | 3000 | **Done** | Login app |
| SSTI | — | — | **Planned** | New app or isolated route |
| SSRF | — | — | **Planned** | Fetch URL feature pattern |

## Suggested build order (after File Upload)

1. **Path traversal** — polish presenter material; optional 720p story slide later.
2. **Open redirect** — extend member shop (`returnUrl`, post-checkout) on a new port or chapter 7.
3. **SSTI** — small template preview endpoint.
4. **SSRF** — server-side “fetch cover art” or webhook URL field.

## HTML / CSS injection without a new repo

- **CSS:** user-controlled profile or opinion styling — document as XSS-adjacent impact (data exfil via selectors) in XSS debrief.
- **HTML:** [FileUpload/samples/evil.html](../FileUpload/samples/evil.html) and opinion field in XSS.

## Cookies (not on agenda slide)

Keep [Cookies/](../Cookies/) as chapter 2 in the repo: SameSite and session cookies underpin CSRF and upload authorization discussions.

See also: [WORKSHOP-ORDER.md](WORKSHOP-ORDER.md)