import type { Express, Request, Response } from "express";
import type { AppDeps } from "../appDeps.ts";
import { buildCommentList, buildLibraryCatalog, type CommentRow } from "../comments.ts";
import { buildMemberSpotlight } from "../profileInjection.ts";
import { buildBuyForm, buildChapterDownloadLink, ownedBlock } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { hasPurchase, loginForSession, recordPurchase, redirectToLoginIfNoSession } from "../session.ts";

const MAX_OPINION_LENGTH = 2000;
const MAX_SEARCH_LENGTH = 200;

export function registerMembersRoutes(app: Express, deps: AppDeps): void {
  const insertComment = deps.db.prepare("INSERT INTO comments (author, body) VALUES (?, ?)");
  const listComments = deps.db.prepare("SELECT author, body FROM comments ORDER BY id ASC");

  app.get("/members", redirectToLoginIfNoSession, async (req: Request, res: Response) => {
    const sessionId = res.locals.sessionId as string;
    const login = loginForSession(sessionId) ?? "";
    const owned = hasPurchase(sessionId);
    const buySection = owned ? ownedBlock : buildBuyForm(deps.bookId);
    const rows = listComments.all() as CommentRow[];
    const searchQuery = readSearchQuery(req.query.q);
    const downloadSection = buildChapterDownloadLink(deps);
    const logins = (deps.db.prepare("SELECT login FROM users ORDER BY login").all() as { login: string }[]).map(
      (row) => row.login,
    );
    await sendShopPage(res, deps.pages.members, {
      "<!-- NAV -->": buildNav(deps, login, "members"),
      "__SEARCH_VALUE__": searchQuery === undefined ? "" : escapeHtmlAttribute(searchQuery),
      "<!-- MEMBER_SPOTLIGHT -->": buildMemberSpotlight(login, logins),
      "<!-- CATALOG -->": buildLibraryCatalog(searchQuery, buySection, downloadSection),
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

function readSearchQuery(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_SEARCH_LENGTH) {
    return undefined;
  }
  return trimmed;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
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
