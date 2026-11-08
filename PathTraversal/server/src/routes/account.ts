import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { clearSessionCookie } from "../cookies.ts";
import { buildDeleteAccountForm } from "../forms.ts";
import { buildAvatarPlaceholder, buildNav, sendShopPage } from "../shopPages.ts";
import { destroySession, loginForSession, redirectToLoginIfNoSession } from "../session.ts";

export function registerAccountRoutes(app: Express, deps: AppDeps): void {
  app.get("/account", redirectToLoginIfNoSession, async (_req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    await sendShopPage(res, deps.pages.account, {
      "<!-- NAV -->": buildNav(deps, login, "account"),
      "<!-- LOGIN -->": login,
      "<!-- AVATAR -->": buildAvatarPlaceholder(),
      "<!-- DELETE -->": buildDeleteAccountForm(),
    });
  });

  app.post("/deleteAccount", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId);
    if (login === undefined) {
      res.redirect("/login");
      return;
    }
    deps.db.prepare("DELETE FROM users WHERE login = ?").run(login);
    destroySession(sessionId);
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.redirect("/login");
  });
}
