# File upload — presenter bullets (English, left column)

Use with [`historical-cases/illustrations/`](historical-cases/illustrations/) on the right.

## Case 1 — PHP shell (CWE-434)

- Multipart upload with real filename `image.php` and body `GIF89a` + `<?php … ?>`.
- Weak server trusts `Content-Type: image/jpeg` and writes under the web root.
- `GET /uploads/image.php` runs because the server maps `.php`, not because of GIF bytes.
- Impact: RCE, secrets on disk, pivot — not a single CVE headline, classic shared-hosting failure mode.

## Case 2 — `.htaccess` (CWE-434)

- Upload config to the upload directory; Apache applies new rules for that folder.
- Attacker adds a new “executable” extension (e.g. `.l33t` as PHP).
- Second upload is a web shell with that extension.

## Case 3 — TimThumb 2011 (CVE-2011-4106)

- Public `timthumb.php` fetches a remote URL and caches under `wp-content`.
- Cache write happens before strict image validation.
- Attacker URL points to a PHP shell; cache path becomes executable.

## Case 4 — SVG avatar (CWE-434 → CWE-79)

- User attaches `avatar.svg`, not markup in the bio field.
- Server stores and serves `/uploads/avatar.svg` on the shop origin.
- Profile view runs script (e.g. cookie exfil via `onload`); `<img>` alone often does not execute script.

## Case 5 — Fake résumé zip

- HR download from a trusted site; archive is malware (`.lnk`), not a CV.
- Teaches delivery abuse and trust in file names — less classic CWE-434 on the app server.

## Case 6 — ImageTragick (CVE-2016-3714)

- Image pipeline processes attacker-controlled SVG/MVG.
- Delegate injection runs shell commands during “resize” or convert.

## Case 7 — IIS semicolon (CVE-2009-4444)

- Filename `evil.asp;.jpg` — filter sees `.jpg`, IIS uses the segment before `;`.
- Script runs despite looking like an image upload.

## Case 8 — Many uploads → application DoS

- Each file is under MAX bytes; many uploads are still accepted.
- No per-user quota or rate limit; `/uploads` grows until disk is full.
- Application-layer DoS (CWE-400), not a network flood.
- Defense: quota, rate limit, replace avatar in place, monitor disk.

## Defense checklist

- Allow-list extensions; do not trust `Content-Type` alone.
- Max bytes per file **and** per user / total storage.
- Authorized users only; CSRF protection on upload forms (see CSRF chapter).
- Dedicated storage volume; AV/sandbox where appropriate.
- Lab **exercise 5:** `VERIFY_IMAGE_MAGIC_BYTES` — still not a full substitute for re-encode (sharp).

## Live demo (instructor)

- **Objective:** Demonstrate application-layer DoS — exhaust disk with many small avatars.
- `USE_SAFE_UPLOAD = false`; ZAP Fuzzer on `filename`; 20–40 requests, ~6–10 threads; `localhost` only.
- Cleanup `public/uploads/` after demo.