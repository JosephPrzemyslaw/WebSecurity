import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { buildCommentList, type CommentRow } from "../comments.ts";
import { buildBuyForm, buildChapterDownloadLink, ownedBlock } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { hasPurchase, loginForSession, recordPurchase, redirectToLoginIfNoSession } from "../session.ts";

const MAX_OPINION_LENGTH = 2000;

export function registerMembersRoutes(app: Express, deps: AppDeps): void {
  const insertComment = deps.db.prepare("INSERT INTO comments (author, body) VALUES (?, ?)");
  const listComments = deps.db.prepare("SELECT author, body FROM comments ORDER BY id ASC");

  app.get("/members", redirectToLoginIfNoSession, async (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    const owned = hasPurchase(sessionId);
    const buySection = owned ? ownedBlock : buildBuyForm(deps.bookId);
    const rows = listComments.all() as CommentRow[];
    await sendShopPage(res, deps.pages.members, {
      "<!-- NAV -->": buildNav(deps, login, "members"),
      "<!-- DOWNLOAD -->": buildChapterDownloadLink(deps),
      "<!-- BUY -->": buySection,
      "<!-- OPINION_ERROR -->": req.query.error === "invalid" ? "" : "hidden",
      "<!-- COMMENTS -->": buildCommentList(rows),
    });
  });

  app.post("/comments", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    const login = loginForSession(res.locals.sessionId as string);
    const body = readOpinion(req.body?.body);
    if (login === undefined || body === undefined) {
      res.redirect("/members?error=invalid");
      return;
    }
    insertComment.run(login, body);
    res.redirect("/members");
  });

  app.post("/buy", redirectToLoginIfNoSession, (req: Request, res: Response) => {
    if (req.body.bookId === deps.bookId) {
      recordPurchase(res.locals.sessionId);
    }
    res.redirect("/members");
  });
}

function readOpinion(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_OPINION_LENGTH) {
    return undefined;
  }
  return trimmed;
}
