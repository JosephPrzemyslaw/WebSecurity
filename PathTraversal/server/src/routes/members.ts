import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { buildBuyForm, buildChapterDownloadLink, ownedBlock } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { hasPurchase, loginForSession, recordPurchase, redirectToLoginIfNoSession } from "../session.ts";

export function registerMembersRoutes(app: Express, deps: AppDeps): void {
  app.get("/members", redirectToLoginIfNoSession, async (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    const owned = hasPurchase(sessionId);
    const buySection = owned ? ownedBlock : buildBuyForm(deps.bookId);
    await sendShopPage(res, deps.pages.members, {
      "<!-- NAV -->": buildNav(deps, login, "members"),
      "<!-- DOWNLOAD -->": buildChapterDownloadLink(deps),
      "<!-- BUY -->": buySection,
    });
  });

  app.post("/buy", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    if (req.body.bookId === deps.bookId) {
      recordPurchase(res.locals.sessionId);
    }
    res.redirect("/members");
  });
}
