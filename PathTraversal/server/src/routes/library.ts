import { access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, resolve } from "node:path";
import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { HttpStatus, sendPlain } from "../responses.ts";
import { redirectToLoginIfNoSession } from "../session.ts";

/** Slide / debrief only — intentional CWE-22 via path.join (not the main workshop route). */
const IMAGES_DIR = join(import.meta.dirname, "..", "..", "public", "images");

/**
 * CWE-22 read: user-controlled path under content/library/books/{book}/chapters/.
 * File upload (CWE-434) uses deps.paths.uploads — not this handler.
 */
function resolveChapterPath(deps: AppDeps, bookName: string, rawChapterRel: string): string {
  const chapterRel = decodeURIComponent(rawChapterRel);
  const libraryRoot = deps.paths.contentLibrary;

  /* Exercise 4 (optional): naive strip — uncomment ONLY for bypass demo; remove for exercises 1–3
  const stripped = chapterRel.replaceAll("../", "");
  return resolve(libraryRoot, "books", bookName, "chapters", stripped);
  */

  /* Exercise fix A: uncomment and use instead of the vulnerable line below
  const chaptersDir = resolve(libraryRoot, "books", bookName, "chapters");
  const candidate = resolve(chaptersDir, chapterRel);
  const root = resolve(chaptersDir);
  if (candidate !== root && !candidate.startsWith(root + join.sep)) {
    throw new Error("outside chapters dir");
  }
  return candidate;
  */

  /* Exercise fix B (allowlist): if (bookName !== deps.bookSlug || chapterRel !== deps.chapterFile) throw … */

  return resolve(libraryRoot, "books", bookName, "chapters", chapterRel);
}

async function serveChapterFile(req: Request, res: Response, deps: AppDeps, bookName: string, chapterRel: string) {
  if (typeof bookName !== "string" || bookName.trim() === "" || typeof chapterRel !== "string" || chapterRel.trim() === "") {
    sendPlain(res, HttpStatus.BadRequest, "Bad request");
    return;
  }

  let filePath: string;
  try {
    filePath = resolveChapterPath(deps, bookName, chapterRel);
  } catch {
    sendPlain(res, HttpStatus.Forbidden, "Not allowed");
    return;
  }

  try {
    await access(filePath);
  } catch {
    sendPlain(res, HttpStatus.NotFound, "File not found");
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      sendPlain(res, HttpStatus.NotFound, "File not found");
    }
  });
  res.type("text/plain; charset=utf-8");
  stream.pipe(res);
}

export function registerLibraryRoutes(app: Express, deps: AppDeps): void {
  app.get(
    "/library/books/:bookName/chapters/*chapterRelPath",
    redirectToLoginIfNoSession,
    async (req: Request, res: Response) => {
      const bookName = req.params.bookName;
      const raw = req.params.chapterRelPath;
      const chapterRel = Array.isArray(raw) ? raw.join("/") : raw;
      if (typeof bookName !== "string" || bookName.trim() === "" || chapterRel === undefined || chapterRel.trim() === "") {
        sendPlain(res, HttpStatus.BadRequest, "Missing chapter path");
        return;
      }
      await serveChapterFile(req, res, deps, bookName, chapterRel);
    },
  );

  registerImageRoute(app);
}

function registerImageRoute(app: Express): void {



  app.get("/images/:imageName", (req: Request, res: Response) => {
    const imageName = req.params.imageName as string;
    const imagePath = join(IMAGES_DIR, imageName);
    createReadStream(imagePath).pipe(res);
  });



}
