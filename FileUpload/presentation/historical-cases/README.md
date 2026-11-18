# File upload — famous cases (links + illustrations)

Each case has a **dual PNG** in [`illustrations/`](illustrations/): **WERSJA PROSTA** (layperson) | **WERSJA TECHNICZNA** (developers).

---

## 1. “Zdjęcie”, które było skryptem PHP (web shell)

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-01-php-shell-dual.png`](illustrations/hist-01-php-shell-dual.png) |
| **PortSwigger — File uploads (teoria + web shell)** | https://portswigger.net/web-security/file-upload |
| **Lab: RCE przez web shell** | https://portswigger.net/web-security/file-upload/lab-file-upload-remote-code-execution-via-web-shell-upload |
| **Lab: blocklist + `.htaccess`** | https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-extension-blacklist-bypass |
| **OWASP — Unrestricted File Upload** | https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload |
| **ZeroExp — brak wykonywania w katalogu uploadów** | https://zeroexp.dev/library/prevent-upload-execution |

---

## 2. Upload `.htaccess` → nowe „rozszerzenie” wykonywalne

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-02-htaccess-dual.png`](illustrations/hist-02-htaccess-dual.png) |
| **PortSwigger lab (krok po kroku)** | https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-extension-blacklist-bypass |
| **OWASP Cheat Sheet — `.htaccess` w uploadzie** | https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html |
| **Cyber Library — `.htaccess` override abuse** | https://www.cyberlibrary.com/en/docs/offensive/software/applications/server/web/platform/apache/handler-and-type-mapping |
| **GitHub Advisory (Vvveb CMS, real-world chain)** | https://github.com/givanz/Vvveb/security/advisories/GHSA-qpcx-gx2x-r8v2 |

---

## 3. TimThumb (WordPress ecosystem, 2011)

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-03-timthumb-dual.png`](illustrations/hist-03-timthumb-dual.png) |
| **CVE-2011-4106 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2011-4106 |
| **Mark Maunder — technical write-up (atak w praktyce)** | https://markmaunder.com/2011/technical-details-and-scripts-of-the-wordpress-timthumb-php-hack/ |
| **TimThumb 2.0 announcement** | https://www.binarymoon.co.uk/2011/08/timthumb-2/ |
| **Wordfence — plugin detail** | https://www.wordfence.com/threat-intel/vulnerabilities/detail/timthumb-133-remote-file-download |

---

## 4. Stored XSS przez upload SVG

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-04-svg-xss-dual.png`](illustrations/hist-04-svg-xss-dual.png) |
| **PortSwigger — client-side scripts via upload (SVG/HTML)** | https://portswigger.net/web-security/file-upload |
| **MOZA write-up** | https://moza369.github.io/writeups/stored-xss-svg-upload/ |
| **TypiCMS advisory (session / admin impact)** | https://github.com/TypiCMS/Core/security/advisories/GHSA-xfvg-8v67-j7wp |
| **ComfyUI advisory (`/view` + SVG inline)** | https://github.com/Comfy-Org/ComfyUI/security/advisories/GHSA-rj8c-c4p8-3c5h |
| **OopsSec — MIME vs bytes + CSP** | https://koadt.github.io/oss-oopssec-store/posts/malicious-file-upload-stored-xss/ |

---

## 5. „CV” dla HR — malware zamiast życiorysu

*(To głównie **social engineering + hosting**, nie klasyczna luka „upload na serwerze” — ale dobrze pokazuje kafelek **malware delivery** ze slajdu impact.)*

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-05-fake-resume-dual.png`](illustrations/hist-05-fake-resume-dual.png) |
| **Arctic Wolf (Venom Spider / More_eggs)** | https://arcticwolf.com/resources/blog/venom-spider-uses-server-side-polymorphism-to-weave-a-web-around-victims/ |
| **CSO Online — summary** | https://www.csoonline.com/article/3977803/fake-resumes-targeting-hr-managers-now-come-with-updated-backdoor.html |
| **The Hacker News (2024)** | https://thehackernews.com/2024/10/fake-job-applications-deliver-dangerous.html |
| **eSentire — LinkedIn lure** | https://www.esentire.com/blog/more-eggs-activity-persists-via-fake-job-applicant-lures |

---

## 6. ImageTragick (ImageMagick, 2016)

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-06-imagetragick-dual.png`](illustrations/hist-06-imagetragick-dual.png) |
| **imagetragick.com (główne źródło + mitigations)** | https://imagetragick.com/ |
| **CVE-2016-3714 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2016-3714 |
| **CERT VU#250519** | https://kb.cert.org/vuls/id/250519 |
| **Cloudflare — real payloads in the wild** | https://blog.cloudflare.com/inside-imagetragick-the-real-payloads-being-used-to-hack-websites-2/ |
| **PoCs (GitHub)** | https://github.com/ImageTragick/PoCs |

---

## 7. IIS — `evil.asp;.jpg` (double extension / semicolon)

| | |
|---|---|
| **Ilustracja** | [`illustrations/hist-07-iis-semicolon-dual.png`](illustrations/hist-07-iis-semicolon-dual.png) |
| **CVE-2009-4444 (NVD)** | https://nvd.nist.gov/vuln/detail/CVE-2009-4444 |
| **Rapid7 — Metasploit + JPG header** | https://old.rapid7.com/blog/post/2009/12/28/exploiting-microsoft-iis-with-metasploit/ |
| **OWASP — bypasses (IIS semicolon, `file.php.jpg`)** | https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload |
| **PortSwigger — double extensions** | https://portswigger.net/web-security/file-upload |

---

## Kolejność plików PNG

```
illustrations/hist-01-php-shell-dual.png
illustrations/hist-02-htaccess-dual.png
illustrations/hist-03-timthumb-dual.png
illustrations/hist-04-svg-xss-dual.png
illustrations/hist-05-fake-resume-dual.png
illustrations/hist-06-imagetragick-dual.png
illustrations/hist-07-iis-semicolon-dual.png
```

Text on images is AI-generated — treat as teaching aids; verify wording before printing.