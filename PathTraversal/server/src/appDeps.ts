import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

export type PagePaths = {
  login: string;
  members: string;
  account: string;
  team: string;
};

/** Filesystem zones — keep separate for path traversal (read) vs file upload (write, next lab). */
export type StoragePaths = {
  /** Root for GET /library/books/:book/chapters/* (CWE-22 read). */
  contentLibrary: string;
  /** Reserved for CWE-434 avatar upload in the next module; served via static only. */
  uploads: string;
};

export type AppDeps = {
  db: DatabaseSync;
  pages: PagePaths;
  paths: StoragePaths;
  bookId: string;
  bookSlug: string;
  chapterFile: string;
};

export function createAppDeps(db: DatabaseSync, srcDir: string): AppDeps {
  const serverDir = join(srcDir, "..");
  const pagesDir = join(serverDir, "pages");
  return {
    db,
    bookId: "1",
    bookSlug: "gone-with-the-wind",
    chapterFile: "chapter-01.txt",
    pages: {
      login: join(pagesDir, "login.html"),
      members: join(pagesDir, "members.html"),
      account: join(pagesDir, "account.html"),
      team: join(pagesDir, "team.html"),
    },
    paths: {
      contentLibrary: join(serverDir, "content", "library"),
      uploads: join(serverDir, "public", "uploads"),
    },
  };
}
