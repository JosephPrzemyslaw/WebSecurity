import { join } from "node:path";
import express, { type Express, type Request, type Response } from "express";
import { prepareDatabase } from "./db.ts";

const port = 3000;
const db = await prepareDatabase();
const app: Express = express();
const publicDir = join(import.meta.dirname, "..", "public");
const membersPage = join(import.meta.dirname, "..", "pages", "members.html");
const loginPage = join(import.meta.dirname, "..", "pages", "login.html");

app.use(express.static(publicDir));

app.get("/", (_: Request, res: Response) => {
  res.sendFile(loginPage);
});

app.get("/login", (req: Request, res: Response) => {
  const login = req.query.login;
  const password = req.query.password;
  if (typeof login !== "string" || typeof password !== "string") {
    res.redirect("/?error=invalid");
    return;
  }

  const query = `SELECT login, password FROM users WHERE login = '${login}' AND password = '${password}'`;
  const user = db
    .prepare(query)
    .get() as { login: string; password: string } | undefined;
  
  if(user === undefined) {
    res.redirect("/?error=invalid");
    return;
  } 

  res.redirect("/members");

});

app.get("/members", (_: Request, res: Response) => {
  res.sendFile(membersPage);
});

app.listen(port, (error?: Error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${port}`);
});
