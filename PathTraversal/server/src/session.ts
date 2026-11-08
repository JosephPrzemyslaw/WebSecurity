import { randomUUID } from "node:crypto";
import { type Request, type Response } from "express";

const session = new Map<string, string>();
const purchases = new Set<string>();

export function createSessionID(login: string): string {
  const sessionId = randomUUID();
  session.set(sessionId, login);
  return sessionId;
}

export function destroySession(sessionId: string): void {
  session.delete(sessionId);
  purchases.delete(sessionId);
}

export function currentSessionId(cookie: string | undefined): string | undefined {
  const sessionPair = cookie?.split(";").find((pair) => pair.trim().split("=")[0] === "session");
  const sessionId = sessionPair?.split("=")[1];

  if (sessionId === undefined || !session.has(sessionId)) {
    return undefined;
  }

  return sessionId;
}

export function loginForSession(sessionId: string): string | undefined {
  return session.get(sessionId);
}

export function hasPurchase(sessionId: string): boolean {
  return purchases.has(sessionId);
}

export function recordPurchase(sessionId: string): void {
  purchases.add(sessionId);
}

function isSession(cookie: string | undefined) {
  return currentSessionId(cookie) !== undefined;
}

export function redirectToMembersIfSession(req: Request, res: Response, next: () => void) {
  if (isSession(req.get("cookie"))) {
    res.redirect("/members");
    return;
  }
  next();
}

export function redirectToLoginIfNoSession(req: Request, res: Response, next: () => void) {
  const sessionId = currentSessionId(req.get("cookie"));
  if (sessionId === undefined) {
    res.redirect("/login");
    return;
  }
  res.locals.sessionId = sessionId;
  next();
}
