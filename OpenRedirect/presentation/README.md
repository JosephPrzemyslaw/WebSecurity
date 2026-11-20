# Open redirect — presentation slides (PNG)

Five **English** slides in **16:9 PNG**, matching the **File Upload DoS story** layout: pastel **watercolor clouds + stars** in corners, **navy** title + gray CWE line, **three numbered panels** (pink / green / blue borders) with **blue hoodie** user and **white-blue robot** server, **speech bubbles**, **yellow Lesson** bar.

General **CWE-601** teaching — not tied step-for-step to port **3006**, but matches the lab (`next`, `USE_SAFE_REDIRECT`).

## Files

Folder: [`png-slides/`](png-slides/)

| Slide | File |
|-------|------|
| 1 | `01-what-is-open-redirect.png` — trusted shop URL → **302** → foreign site |
| 2 | `02-phishing-three-steps.png` — email link, real login, phishing landing |
| 3 | `03-who-sets-next.png` — server `next=/account` vs attacker `next=https://…` |
| 4 | `04-impact-tiles.png` — phishing, OAuth chains, trust, not server RCE |
| 5 | `05-prevention-fix.png` — allow-list paths, block absolute URLs, validate before redirect |

Order: [`png-slides/00-slide-order.txt`](png-slides/00-slide-order.txt)

## Lab story (720p)

[`illustrations/hist-open-redirect-story-720p.png`](illustrations/hist-open-redirect-story-720p.png) — legal flow: `/account` → login with `next` → back to profile.

Import PNGs into Keynote / PowerPoint (Insert → Picture). Text is baked into the image.