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
  bookId: string;
};

export function createAppDeps(db: DatabaseSync, srcDir: string): AppDeps {
  const pagesDir = join(srcDir, "..", "pages");
  return {
    db,
    bookId: "1",
    pages: {
      login: join(pagesDir, "login.html"),
      members: join(pagesDir, "members.html"),
      account: join(pagesDir, "account.html"),
      team: join(pagesDir, "team.html"),
    },
  };
}
