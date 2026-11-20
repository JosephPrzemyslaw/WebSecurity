# Workshop order — agenda vs repository

Two valid ways to run the course. Pick one up front so learners know whether they are **revisiting** Path traversal after File Upload or **meeting it for the first time**.

## Agenda order (your slide list)

Typical day flow when the slide deck follows this list:

1. HTML / CSS injection — tie to [XSS](../XSS/) (SVG, markup in opinions); no separate lab folder.
2. XSS — [XSS/](../XSS/) port **3002**
3. CSRF — [CSRF/](../CSRF/) port **3003**
4. Open Redirect — **not in repo yet** (see [WORKSHOP-ROADMAP.md](WORKSHOP-ROADMAP.md))
5. **File Upload** — [FileUpload/](../FileUpload/) port **3005** (end of this block: live DoS + defense checklist)
6. **Path traversal** — [PathTraversal/](../PathTraversal/) port **3004** — *first hands-on path lab for this audience*
7. SQL injection — [SQLInjection/](../SQLInjection/) port **3000**
8. SSTI / SSRF — planned labs (roadmap)

**Narrative after File Upload:** Path traversal is **reading** arbitrary files (CWE-22). File Upload was **writing** into `public/uploads/` (CWE-434). Same shop, opposite direction on disk.

## Repository chapter order (shop storyline)

Builds one application over chapters 1–6:

| Ch | Module | Port |
|----|--------|------|
| 1 | [SQLInjection](../SQLInjection/) | 3000 |
| 2 | [Cookies](../Cookies/) | 3001 |
| 3 | [CSRF](../CSRF/) | 3003 |
| 4 | [PathTraversal](../PathTraversal/) | 3004 |
| 5 | [XSS](../XSS/) | 3002 |
| 6 | [FileUpload](../FileUpload/) | 3005 |

Use this order when learners clone the repo and work **sequentially**. Path traversal comes **before** File Upload in the story.

## File Upload block on stage (either order)

1. Historical case slides ([`FileUpload/presentation/historical-cases/`](../FileUpload/presentation/historical-cases/))
2. Lab exercises **1–4** (then **5** magic bytes if time)
3. Slajd DoS + instructor demo ([README § Instructor](../FileUpload/README.md))
4. Defense checklist slide + debrief

Presenter bullets: [`FileUpload/presentation/PRESENTER-BULLETS.md`](../FileUpload/presentation/PRESENTER-BULLETS.md)

## Recommendation

| Audience | Use |
|----------|-----|
| Slide agenda as listed above | **Agenda order** — after File Upload, open PathTraversal README and port **3004** |
| Self-paced repo walkthrough | **Chapter order** in [README.md](../README.md) |

Mention **Cookies** (chapter 2) when teaching CSRF and upload abuse even if it is not on the agenda slide.