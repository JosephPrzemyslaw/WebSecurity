# File upload — famous cases (links + illustrations)

Each case has a PNG in [`illustrations/`](illustrations/). Case **#1** uses **two** slides (no MITM — only the attacker).

---

## 1. Upload `image.php` + spoofed headers → RCE (web shell)

| | |
|---|---|
| **Lekko technicznie** | [`illustrations/hist-01-php-shell-light.png`](illustrations/hist-01-php-shell-light.png) |
| **Skrajnie technicznie** | [`illustrations/hist-01-php-shell-technical.png`](illustrations/hist-01-php-shell-technical.png) |
| **Obejścia rozszerzeń (opcjonalnie)** | [`hist-01-why-jpg-vs-php.png`](illustrations/hist-01-why-jpg-vs-php.png) |
| **PortSwigger — File uploads (theory + web shell)** | https://portswigger.net/web-security/file-upload |
| **Lab: RCE via web shell** | https://portswigger.net/web-security/file-upload/lab-file-upload-remote-code-execution-via-web-shell-upload |
| **Lab: blocklist + `.htaccess`** | https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-extension-blacklist-bypass |
| **OWASP — Unrestricted File Upload** | https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload |
| **ZeroExp — disable execution in upload dirs** | https://zeroexp.dev/library/prevent-upload-execution |

**Story (correct model — no Burp, no victim):**

1. **Attacker** uploads **`image.php`** (web shell inside), sets **`Content-Type: image/jpeg`** in the multipart part.
2. **Weak backend** checks only the header (or extension allow-list is missing) → saves **`/uploads/image.php`**.
3. Attacker calls **`GET /uploads/image.php?cmd=…`** → **mod_php** runs the file → **RCE**.

**Impact:**
   - Read secrets from disk (config, keys, `secret` files)
   - Dump or copy the **database** (customers, passwords hashes, orders)
   - **Change the shop** (defacement, scam page, malware for visitors)
   - **Pivot** — use your server to attack others (spam, bots, mining)

**Technical body (example):**

```
Content-Disposition: form-data; name="file"; filename="image.php"
Content-Type: image/jpeg

GIF89a;
<?php system($_GET['cmd']); ?>
```

Then `GET /uploads/image.php?cmd=cat%20secret` → `system()` → exfiltration / backdoor.

**Real history (important):** This is **not** a single newspaper headline like TimThumb 2011 — it is the **default failure mode** of **PHP + Apache shared hosting** from the **2000s–2010s** until today on misconfigured sites. Pentesters and criminals repeatedly found: avatar/CV/gallery upload → file saved under the web root → **mod_php runs `.php`**. [PortSwigger Web Security Academy](https://portswigger.net/web-security/file-upload) built its **RCE upload labs** on this exact chain (e.g. reading `/home/carlos/secret`). Classified under **CWE-434** / OWASP “Unrestricted File Upload”. Your **Node shop lab** intentionally does **not** execute uploads — this case explains **server-side** impact when the stack **does** run PHP.

---

## 2. Uploading `.htaccess` → a new “executable” extension

| | |
|---|---|
| **Illustration** | [`illustrations/hist-02-htaccess-dual.png`](illustrations/hist-02-htaccess-dual.png) |
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
| **Illustration** | [`illustrations/hist-03-timthumb-dual.png`](illustrations/hist-03-timthumb-dual.png) |
| **CVE-2011-4106 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2011-4106 |
| **Mark Maunder — technical write-up** | https://markmaunder.com/2011/technical-details-and-scripts-of-the-wordpress-timthumb-php-hack/ |
| **TimThumb 2.0 announcement** | https://www.binarymoon.co.uk/2011/08/timthumb-2/ |
| **Wordfence — TimThumb ≤ 1.33** | https://www.wordfence.com/threat-intel/vulnerabilities/detail/timthumb-133-remote-file-download |

**Plain language:** A thumbnail helper downloads a “image” from a forged address, saves it where anyone can open it, and the site is compromised.

**Technical:** Broken domain whitelist on `src` → remote PHP lands in `cache/` → direct HTTP request executes it (CVE-2011-4106).

---

## 4. Stored XSS via SVG upload

| | |
|---|---|
| **Illustration** | [`illustrations/hist-04-svg-xss-dual.png`](illustrations/hist-04-svg-xss-dual.png) |
| **PortSwigger — client-side scripts (SVG/HTML uploads)** | https://portswigger.net/web-security/file-upload |
| **PacketWanderer — Stored XSS via SVG** | https://packetwanderer.com/posts/svg-xss/ |
| **TypiCMS advisory** | https://github.com/TypiCMS/Core/security/advisories/GHSA-xfvg-8v67-j7wp |
| **ComfyUI advisory (`/view` + inline SVG)** | https://github.com/Comfy-Org/ComfyUI/security/advisories/GHSA-rj8c-c4p8-3c5h |
| **OopsSec — MIME vs bytes + CSP** | https://koadt.github.io/oss-oopssec-store/posts/malicious-file-upload-stored-xss/ |

**Plain language:** A file looks like a diagram; opening the link runs a hidden script and can steal login sessions.

**Technical:** Upload `image/svg+xml` with `onload` / `<script>` → served inline or at a direct URL on the same origin → stored XSS (`<img>` often does **not** run the script).

---

## 5. Fake “resume” for HR — malware, not a CV

*(Mostly **phishing + file delivery**, not a classic “broken upload” on the app server — but it illustrates **malware hosting on a trusted name**.)*

| | |
|---|---|
| **Illustration** | [`illustrations/hist-05-fake-resume-dual.png`](illustrations/hist-05-fake-resume-dual.png) |
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
| **Illustration** | [`illustrations/hist-06-imagetragick-dual.png`](illustrations/hist-06-imagetragick-dual.png) |
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
| **Illustration** | [`illustrations/hist-07-iis-semicolon-dual.png`](illustrations/hist-07-iis-semicolon-dual.png) |
| **CVE-2009-4444 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2009-4444 |
| **Rapid7 — Metasploit + JPG header** | https://old.rapid7.com/blog/post/2009/12/28/exploiting-microsoft-iis-with-metasploit/ |
| **OWASP — bypass list (IIS semicolon, double ext.)** | https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload |
| **PortSwigger — double extensions** | https://portswigger.net/web-security/file-upload |

**Plain language:** The filename looks like `.jpg`, but legacy IIS treats part of the name differently and runs it as a server script.

**Technical:** CVE-2009-4444 — IIS uses the extension **before** `;`; the upload filter only checks `.jpg`.

---

## File order

```
illustrations/hist-01-php-shell-dual.png
illustrations/hist-02-htaccess-dual.png
illustrations/hist-03-timthumb-dual.png
illustrations/hist-04-svg-xss-dual.png
illustrations/hist-05-fake-resume-dual.png
illustrations/hist-06-imagetragick-dual.png
illustrations/hist-07-iis-semicolon-dual.png
```

On-image text is AI-generated — proofread before printing or projecting.