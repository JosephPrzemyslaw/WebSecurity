import { type Request, type Response } from "express";

const session = new Map<string, string>();

export function createSessionID(login:string): string {
    const sessionId = login;
    session.set(sessionId, login);

    return sessionId;
}

export default function isSession(cookie:string | undefined) {
    const sessionPair = cookie?.split(";").find(pair => pair.trim().split("=")[0] === "session");
    const sessionId = sessionPair?.split("=")[1];

    return sessionId && session.has(sessionId);
}

export function redirectToMembersIfSession(req: Request, res: Response, next: () => void) {
    if (isSession(req.get("cookie"))) {
      res.redirect("/members");
      return;
    }
    next();
}

export function redirectToLoginIfNoSession(req: Request, res: Response, next: () => void) {
    if (!isSession(req.get("cookie"))) {
      res.redirect("/login");
      return;
    }
    next();
}
