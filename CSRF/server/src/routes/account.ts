import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { clearSessionCookie } from "../cookies.ts";
import { buildDeleteAccountForm } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { HttpStatus, sendPlain } from "../responses.ts";
import { destroySession, loginForSession, redirectToLoginIfNoSession } from "../session.ts";

export function registerAccountRoutes(app: Express, deps: AppDeps): void {
  app.get("/account", redirectToLoginIfNoSession, async (_req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    /* Exercise 2: uncomment after CSRF block in session.ts
    const deleteSection = buildDeleteAccountForm(csrfTokenFor(sessionId));
    */
    const deleteSection = buildDeleteAccountForm();
    await sendShopPage(res, deps.pages.account, {
      "<!-- NAV -->": buildNav(deps, login, "account"),
      "<!-- LOGIN -->": login,
      "<!-- DELETE -->": deleteSection,
    });
  });

  // Exercise 2 — CWE-352: cross-site POST can delete the signed-in account.
  app.post("/deleteAccount", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    /* Exercise 2: uncomment
    if (!csrfTokenValid(res.locals.sessionId, req.body.csrfToken)) {
      sendPlain(res, HttpStatus.Forbidden, "CSRF token missing or invalid");
      return;
    }
    */
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId);
    if (login === undefined) {
      res.redirect("/login");
      return;
    }
    deps.db.prepare("DELETE FROM users WHERE login = ?").run(login);
    destroySession(sessionId);
    /* Exercise 1–3: uncomment when CSRF block in session.ts is active
    clearCsrfToken(sessionId);
    */
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.redirect("/login");
  });
}
