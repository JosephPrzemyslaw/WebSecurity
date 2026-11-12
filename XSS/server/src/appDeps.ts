import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

export type PagePaths = {
  login: string;
  members: string;
  account: string;
  team: string;
};

export type AppDeps = {
  db: DatabaseSync;
  pages: PagePaths;
  contentLibrary: string;
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
    contentLibrary: join(serverDir, "content", "library"),
    pages: {
      login: join(pagesDir, "login.html"),
      members: join(pagesDir, "members.html"),
      account: join(pagesDir, "account.html"),
      team: join(pagesDir, "team.html"),
    },
  };
}
