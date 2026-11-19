import type { Express, Request, Response } from "express";
import multer from "multer";
import type { AppDeps } from "../appDeps.ts";
import { clearSessionCookie } from "../cookies.ts";
import { buildDeleteAccountForm } from "../forms.ts";
import { buildNav, sendShopPage } from "../shopPages.ts";
import { destroySession, loginForSession, redirectToLoginIfNoSession } from "../session.ts";
import {
  UPLOAD_MAX_BYTES,
  avatarPreviewFor,
  buildAvatarPreview,
  saveUploadedAvatar,
} from "../upload.ts";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_BYTES },
});

export function registerAccountRoutes(app: Express, deps: AppDeps): void {
  app.get("/account", redirectToLoginIfNoSession, async (req: Request, res: Response) => {
    const login = loginForSession(res.locals.sessionId as string) ?? "";
    await sendShopPage(res, deps.pages.account, {
      "<!-- NAV -->": buildNav(deps, login, "account"),
      "<!-- LOGIN -->": login,
      "<!-- UPLOAD_ERROR -->": req.query.error === "invalid" ? "" : "hidden",
      "<!-- AVATAR_PREVIEW -->": buildAvatarPreview(avatarPreviewFor(login)),
      "<!-- DELETE -->": buildDeleteAccountForm(),
    });
  });

  app.post(
    "/account/avatar",
    redirectToLoginIfNoSession,
    upload.single("avatar"),
    async (req: Request, res: Response) => {
      const login = loginForSession(res.locals.sessionId as string);
      const file = req.file;
      if (login === undefined || file === undefined) {
        res.redirect("/account?error=invalid");
        return;
      }
      const ok = await saveUploadedAvatar(deps, login, file);
      res.redirect(ok ? "/account" : "/account?error=invalid");
    },
  );

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