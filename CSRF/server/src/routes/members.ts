import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { buildBuyForm, ownedBlock } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { HttpStatus, sendPlain } from "../responses.ts";
import { hasPurchase, loginForSession, recordPurchase, redirectToLoginIfNoSession } from "../session.ts";

export function registerMembersRoutes(app: Express, deps: AppDeps): void {
  app.get("/members", redirectToLoginIfNoSession, async (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    const owned = hasPurchase(sessionId);
    /* Exercise 1: uncomment after CSRF block in session.ts
    const buyForm = buildBuyForm(deps.bookId, csrfTokenFor(sessionId));
    */
    const buyForm = buildBuyForm(deps.bookId);
    await sendShopPage(res, deps.pages.members, {
      "<!-- NAV -->": buildNav(deps, login, "members"),
      "<!-- BUY -->": owned ? ownedBlock : buyForm,
    });
  });

  // Exercise 1 — CWE-352: no CSRF token yet (see commented guard below).
  app.post("/buy", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    /* Exercise 1: uncomment after CSRF helpers in session.ts
    if (!csrfTokenValid(res.locals.sessionId, req.body.csrfToken)) {
      sendPlain(res, HttpStatus.Forbidden, "CSRF token missing or invalid");
      return;
    }
    */
    if (req.body.bookId === deps.bookId) {
      recordPurchase(res.locals.sessionId);
    }
    res.redirect("/members");
  });
}
