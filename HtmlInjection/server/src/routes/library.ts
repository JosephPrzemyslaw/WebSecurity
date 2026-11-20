import { access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, sep } from "node:path";
import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { HttpStatus, sendPlain } from "../responses.ts";
import { redirectToLoginIfNoSession } from "../session.ts";

/**
 * Path Traversal fix, already on in this lab (not an exercise).
 * Resolve the chapter path and reject it unless it stays under that book's chapters directory.
 */
function resolveChapterPath(deps: AppDeps, bookName: string, rawChapterRel: string): string {
  const chapterRel = decodeURIComponent(rawChapterRel);
  const chaptersDir = resolve(deps.contentLibrary, "books", bookName, "chapters");
  const candidate = resolve(chaptersDir, chapterRel);
  if (!candidate.startsWith(chaptersDir + sep)) {
    throw new Error("outside chapters dir");
  }
  return candidate;
}

async function serveChapterFile(res: Response, deps: AppDeps, bookName: string, chapterRel: string) {
  if (bookName.trim() === "" || chapterRel.trim() === "") {
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
      if (typeof bookName !== "string" || chapterRel === undefined || chapterRel.trim() === "") {
        sendPlain(res, HttpStatus.BadRequest, "Missing chapter path");
        return;
      }
      await serveChapterFile(res, deps, bookName, chapterRel);
    },
  );
}
