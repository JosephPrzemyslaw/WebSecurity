import { join } from "node:path";
import express, { type Express, type Request, type Response } from "express";
import { prepareDatabase } from "./db.ts";

const port = 3000;
const db = await prepareDatabase();
const app: Express = express();
const publicDir = join(import.meta.dirname, "..", "public");

app.use(express.static(publicDir));

app.get("/login", (req: Request, res: Response) => {
  
  const login = req.query.login;
  const password = req.query.password;
  if (typeof login !== "string" || typeof password !== "string") {
    res.redirect("/?error=invalid");
    return;
  }

  try {
    const query = `SELECT login, password FROM users WHERE login = '${login}' AND password = '${password}'`;
    const user = db
      .prepare(query)
      .get() as { login: string; password: string } | undefined;
    
    if(user === undefined) {
      res.redirect("/?error=invalid");
      return;
    } 

    res.redirect("/members.html");
  } catch (error) {
    res.redirect("/?error=server");
    return;
  }
});

app.listen(port, (error?: Error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${port}`);
});
