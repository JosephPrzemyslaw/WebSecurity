import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { clearSessionCookie, sessionCookie } from "../cookies.ts";
import { createSessionID, destroySession, redirectToLoginIfNoSession, redirectToMembersIfSession } from "../session.ts";

export function registerAuthRoutes(app: Express, deps: AppDeps): void {
  app.get(["/", "/login"], redirectToMembersIfSession, (_: Request, res: Response) => {
    res.sendFile(deps.pages.login);
  });

  app.post("/login", redirectToMembersIfSession, (req: Request, res: Response) => {
    const login = req.body.login;
    const password = req.body.password;
    if (typeof login !== "string" || typeof password !== "string") {
      res.redirect(`/login?error=invalid`);
      return;
    }

    try {
      const user = deps.db
        .prepare(`SELECT login, password FROM users WHERE login = ? AND password = ?`)
        .get(login, password) as { login: string; password: string } | undefined;

      if (user === undefined) {
        res.redirect("/login?error=invalid");
        return;
      }

      const sessionId = createSessionID(user.login);
      /* Exercise 1: uncomment after CSRF block in session.ts
      issueCsrfToken(sessionId);
      */
      res.setHeader("Set-Cookie", sessionCookie(sessionId));
      res.redirect("/members");
    } catch {
      res.redirect("/login?error=server");
    }
  });

  app.post("/logout", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    destroySession(sessionId);
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.redirect("/login");
  });
}
