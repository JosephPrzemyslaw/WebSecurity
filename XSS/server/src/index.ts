import { readFile } from "node:fs/promises";
import { join } from "node:path";
import express, { type Express, type Request, type Response } from "express";
import { prepareDatabase } from "./db.ts";

const port = 3002;
const db = await prepareDatabase();
const app: Express = express();
const publicDir = join(import.meta.dirname, "..", "public");
const membersPage = join(import.meta.dirname, "..", "pages", "members.html");

app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false }));

app.get("/", async (_: Request, res: Response) => {
  const comments = db
    .prepare("SELECT body FROM comments ORDER BY id")
    .all() as { body: string }[];
  const page = await readFile(membersPage, "utf8");
  res.type("html").send(page.replace("<!-- COMMENTS -->", renderComments(comments)));
});

app.post("/comments", (req: Request, res: Response) => {
  const comment = req.body.comment;
  if (typeof comment !== "string" || comment.trim() === "") {
    res.redirect("/");
    return;
  }

  db.prepare("INSERT INTO comments (body) VALUES (?)").run(comment);
  res.redirect("/");
});

function renderComments(comments: { body: string }[]): string {
  let snippet = "";
  for (const comment of comments) {
    snippet += `<article class="comment"><p>${comment.body}</p></article>`;
  }
  return snippet;
}

app.listen(port, (error?: Error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${port}`);
});
