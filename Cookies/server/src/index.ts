import { join } from "node:path";
import express, { type Express, type Request, type Response } from "express";
import { prepareDatabase } from "./db.ts";
import { redirectToLoginIfNoSession, redirectToMembersIfSession, createSessionID } from "./session.ts";

const port = 3001;
const db = await prepareDatabase();
const app: Express = express();
const publicDir = join(import.meta.dirname, "..", "public");
const loginPage = join(import.meta.dirname, "..", "pages", "login.html");
const membersPage = join(import.meta.dirname, "..", "pages", "members.html");
app.use(express.urlencoded({ extended: false }));

app.get(["/", "/login"], redirectToMembersIfSession, (_: Request, res: Response) => {
  res.sendFile(loginPage);
});

app.post("/login", redirectToMembersIfSession, (req: Request, res: Response) => {
  const login = req.body.login;
  const password = req.body.password;
  if (typeof login !== "string" || typeof password !== "string") {
    res.redirect(`/login?error=invalid`);
    return;
  }
  
  try {
    const query = `SELECT login, password FROM users WHERE login = ? AND password = ?`;
    const user = db
      .prepare(query)
      .get(login, password) as { login: string; password: string } | undefined;

    if (user === undefined) {
      res.redirect("/login?error=invalid");
      return;
    }

    const sessionId = createSessionID(user.login);
    res.setHeader("Set-Cookie", `session=${sessionId}; Path=/`);
    res.redirect("/members");
  } catch {
    res.redirect("/login?error=server");
    return;
  }
});

app.get("/members", redirectToLoginIfNoSession, (_: Request, res: Response) => {
  res.sendFile(membersPage);
});

app.use(express.static(publicDir));

app.listen(port, (error?: Error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${port}`);
});
