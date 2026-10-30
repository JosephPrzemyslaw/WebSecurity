import { readFile } from "node:fs/promises";
import { join } from "node:path";
import express, { type Express, type Request, type Response } from "express";
import { prepareDatabase } from "./db.ts";
import { redirectToLoginIfNoSession, redirectToMembersIfSession, createSessionID, hasPurchase, recordPurchase } from "./session.ts";

const port = 3001;
const bookId = "1";
const db = await prepareDatabase();
const app: Express = express();
const publicDir = join(import.meta.dirname, "..", "public");
const loginPage = join(import.meta.dirname, "..", "pages", "login.html");
const membersPage = join(import.meta.dirname, "..", "pages", "members.html");
const buyForm = `<form method="POST" action="/buy" class="buy-form">
            <input type="hidden" name="bookId" value="${bookId}" />
            <p class="price"><span class="price-label">Price</span> <strong>€12.00</strong></p>
            <button class="submit buy" type="submit">Buy now</button>
          </form>`;
const ownedBlock = `<p class="status status--owned">You own this book. It’s in your library.</p>`;
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
    // Ex. 3–4: OWASP A02 — CWE-1004 (no HttpOnly), CWE-614 (Secure when removed in demo).
    // Ex. 5: SameSite=None — OWASP A01 — CWE-1275 + CWE-352 (CSRF on POST /buy).
    res.setHeader("Set-Cookie", `session=${sessionId}; Path=/; SameSite=None; Secure`);
    res.redirect("/members");
  } catch {
    res.redirect("/login?error=server");
    return;
  }
});

app.get("/members", redirectToLoginIfNoSession, async (_req: Request, res: Response) => {
  const page = await readFile(membersPage, "utf8");
  const owned = hasPurchase(res.locals.sessionId);
  res.type("html").send(page.replace("<!-- BUY -->", owned ? ownedBlock : buyForm));
});

// Exercise 5: no CSRF token (CWE-352). SameSite=None (CWE-1275). OWASP Top 10:2025 A01.
app.post("/buy", redirectToLoginIfNoSession, (req: Request, res: Response) => {
  if (req.body.bookId === bookId) {
    recordPurchase(res.locals.sessionId);
  }
  res.redirect("/members");
});

app.use(express.static(publicDir));

app.listen(port, (error?: Error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Shop is running on http://localhost:${port}`);
});
