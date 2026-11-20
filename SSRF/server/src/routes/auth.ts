import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { clearSessionCookie, sessionCookie } from "../cookies.ts";
import { resolvePostLoginRedirect } from "../redirect.ts";
import { createSessionID, destroySession, redirectToLoginIfNoSession, redirectToMembersIfSession } from "../session.ts";

function loginRedirectUrl(error: "invalid" | "server", next: unknown): string {
  const base = error === "invalid" ? "/login?error=invalid" : "/login?error=server";
  if (typeof next === "string" && next.length > 0) {
    return `${base}&next=${encodeURIComponent(next)}`;
  }
  return base;
}

export function registerAuthRoutes(app: Express, deps: AppDeps): void {
  app.get(["/", "/login"], redirectToMembersIfSession, (_: Request, res: Response) => {
    res.sendFile(deps.pages.login);
  });

  app.post("/login", redirectToMembersIfSession, (req: Request, res: Response) => {
    const login = req.body.login;
    const password = req.body.password;
    const next = req.body.next;
    if (typeof login !== "string" || typeof password !== "string") {
      res.redirect(loginRedirectUrl("invalid", next));
      return;
    }

    try {
      const user = deps.db
        .prepare(`SELECT login, password FROM users WHERE login = ? AND password = ?`)
        .get(login, password) as { login: string; password: string } | undefined;

      if (user === undefined) {
        res.redirect(loginRedirectUrl("invalid", next));
        return;
      }

      const sessionId = createSessionID(user.login);
      res.setHeader("Set-Cookie", sessionCookie(sessionId));
      res.redirect(resolvePostLoginRedirect(next));
    } catch {
      res.redirect(loginRedirectUrl("server", next));
    }
  });

  app.post("/logout", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    destroySession(sessionId);
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.redirect("/login");
  });
}