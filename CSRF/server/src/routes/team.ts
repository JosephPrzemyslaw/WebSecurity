import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { buildAddUserForm, buildTeamStatus } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { loginForSession, redirectToLoginIfNoSession } from "../session.ts";
import { HttpStatus, prefersHtmlNavigation, sendPlain } from "../responses.ts";
import { insertUser, isAdminLogin, parseAddUserFields } from "../users.ts";

export function registerTeamRoutes(app: Express, deps: AppDeps): void {
  app.get("/team", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    if (!isAdminLogin(deps.db, login)) {
      res.redirect("/members");
      return;
    }
    /* Exercise 3: uncomment after CSRF block in session.ts
    const adminForm = buildAddUserForm(csrfTokenFor(sessionId));
    */
    const adminForm = buildAddUserForm();
    void sendShopPage(res, deps.pages.team, {
      "<!-- NAV -->": buildNav(deps, login, "team"),
      "<!-- ADMIN -->": adminForm,
      "<!-- STATUS -->": buildTeamStatus(req.query.created),
    });
  });

  // Exercise 3 — GET /addUsers mutates state (intentionally bad API). CWE-352: no CSRF token yet.
  app.get("/addUsers", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const login = loginForSession(res.locals.sessionId);
    if (login === undefined || !isAdminLogin(deps.db, login)) {
      sendPlain(res, HttpStatus.Forbidden);
      return;
    }
    /* Exercise 3: uncomment after CSRF helpers in session.ts
    if (!csrfTokenValid(res.locals.sessionId, req.query.csrfToken)) {
      sendPlain(res, HttpStatus.Forbidden, "CSRF token missing or invalid");
      return;
    }
    */
    const fields = parseAddUserFields(req.query.login, req.query.password, req.query.type);
    if (fields === undefined) {
      sendPlain(res, HttpStatus.BadRequest);
      return;
    }
    if (insertUser(deps.db, fields) === "exists") {
      sendPlain(res, HttpStatus.Conflict);
      return;
    }
    if (prefersHtmlNavigation(req)) {
      res.redirect(`/team?created=${encodeURIComponent(fields.login)}`);
      return;
    }
    sendPlain(res, HttpStatus.NoContent);
  });
}
