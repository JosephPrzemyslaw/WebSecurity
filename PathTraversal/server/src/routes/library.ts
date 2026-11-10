import { access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, resolve, sep } from "node:path";
import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { HttpStatus, sendPlain } from "../responses.ts";
import { redirectToLoginIfNoSession } from "../session.ts";

/**
 * CWE-22 read: user-controlled path under content/library/books/{book}/chapters/.
 * File upload (CWE-434) uses deps.paths.uploads — not this handler.
 *
 * Exercises 1–3: leave the next line as-is (`false`).
 * Exercise 4: uncomment the line below and comment out `false` (Fix A — jail under chapters/).
 */
const USE_SAFE_CHAPTER_PATH = false;
// const USE_SAFE_CHAPTER_PATH = true;

function resolveChapterPath(deps: AppDeps, bookName: string, rawChapterRel: string): string {
  const chapterRel = decodeURIComponent(rawChapterRel);
  const libraryRoot = deps.paths.contentLibrary;

  if (USE_SAFE_CHAPTER_PATH) {
    const chaptersDir = resolve(libraryRoot, "books", bookName, "chapters");
    const candidate = resolve(chaptersDir, chapterRel);
    const root = resolve(chaptersDir);
    if (candidate !== root && !candidate.startsWith(root + sep)) {
      throw new Error("outside chapters dir");
    }
    return candidate;
  }

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
      const bookNameRaw = req.params.bookName;
      const bookName = Array.isArray(bookNameRaw) ? bookNameRaw[0] : bookNameRaw;
      const raw = req.params.chapterRelPath;
      const chapterRel = Array.isArray(raw) ? raw.join("/") : raw;
      if (chapterRel === undefined || chapterRel.trim() === "") {
        sendPlain(res, HttpStatus.BadRequest, "Missing chapter path");
        return;
      }
      await serveChapterFile(req, res, deps, bookName, chapterRel);
    },
  );
}
