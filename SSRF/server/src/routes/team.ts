import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { buildAddUserForm, buildTeamStatus } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { HttpStatus, sendPlain } from "../responses.ts";
import { loginForSession, redirectToLoginIfNoSession } from "../session.ts";
import { insertUser, isAdminLogin, parseAddUserFields } from "../users.ts";

export function registerTeamRoutes(app: Express, deps: AppDeps): void {
  app.get("/team", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    if (!isAdminLogin(deps.db, login)) {
      res.redirect("/members");
      return;
    }
    void sendShopPage(res, deps.pages.team, {
      "<!-- NAV -->": buildNav(deps, login, "team"),
      "<!-- ADMIN -->": buildAddUserForm(),
      "<!-- STATUS -->": buildTeamStatus(req.query.created),
    });
  });

  app.get("/addUsers", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const login = loginForSession(res.locals.sessionId);
    if (login === undefined || !isAdminLogin(deps.db, login)) {
      sendPlain(res, HttpStatus.Forbidden, "Forbidden");
      return;
    }
    const fields = parseAddUserFields(req.query.login, req.query.password, req.query.type);
    if (fields === undefined) {
      sendPlain(res, HttpStatus.BadRequest, "Bad request");
      return;
    }
    if (insertUser(deps.db, fields) === "exists") {
      sendPlain(res, HttpStatus.Forbidden, "User exists");
      return;
    }
    res.redirect(`/team?created=${encodeURIComponent(fields.login)}`);
  });
}
