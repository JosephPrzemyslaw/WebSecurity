import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export async function prepareDatabase(): Promise<DatabaseSync> {
  const sqlPath = join(import.meta.dirname, "..", "sql", "init.sql");
  const sql = await readFile(sqlPath, "utf8");
  const db = new DatabaseSync(":memory:");
  db.exec(sql);

  return db;
}

